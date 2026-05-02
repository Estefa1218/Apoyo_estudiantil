// src/services/emailResponseService.js
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const pool = require('../config/db');

function extractInitialStudentResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  const lines = rawText.split(/\r?\n/).map(l => l.trim());
  const filtered = [];

  for (const line of lines) {
    if (!line) continue;
    if (/^>/.test(line)) continue; // líneas citadas
    if (/^on .* wrote:$/i.test(line)) continue; // cabeceras de forward/reply
    if (/^---+$/.test(line)) continue; // separadores
    if (/^from:/i.test(line) || /^sent:/i.test(line) || /^to:/i.test(line)) continue;

    filtered.push(line);
    if (filtered.length >= 3) break; // tomar hasta 3 líneas iniciales
  }

  if (filtered.length === 0) return '';

  const result = filtered.join(' ');
  return result.substring(0, 1000); // cortar para no overflow
}

class EmailResponseService {
  constructor() {
    this.imap = null;
    this.isRunning = false;
  }

  async getColumnMetadata(tableName, columnName) {
    try {
      const [rows] = await pool.execute(
        `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [process.env.DB_NAME, tableName, columnName]
      );
      return rows[0] || null;
    } catch (err) {
      console.warn(`⚠️ No se pudo leer metadata de ${tableName}.${columnName}:`, err.message);
      return null;
    }
  }

  async normalizeInsertValue(tableName, columnName, value) {
    const metadata = await this.getColumnMetadata(tableName, columnName);
    if (!metadata || value == null) return value;

    const stringValue = String(value);

    if (metadata.COLUMN_TYPE.startsWith('enum(')) {
      const allowed = metadata.COLUMN_TYPE
        .match(/^enum\((.*)\)$/i)[1]
        .split(/,(?=(?:[^']*'[^']*')*[^']*$)/)
        .map(v => v.trim().replace(/^'(.*)'$/, '$1'));

      if (allowed.includes(stringValue)) return stringValue;
      if (allowed.includes('email')) return 'email';
      if (allowed.includes('mail')) return 'mail';
      if (allowed.includes('respuesta')) return 'respuesta';
      if (allowed.includes('otro')) return 'otro';
      return allowed[0] || stringValue.substring(0, metadata.CHARACTER_MAXIMUM_LENGTH || stringValue.length);
    }

    if (metadata.CHARACTER_MAXIMUM_LENGTH) {
      return stringValue.substring(0, metadata.CHARACTER_MAXIMUM_LENGTH);
    }

    return stringValue;
  }

  // Inicializar conexión IMAP
  initializeImap() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: true,
    });
  }

  // Conectar y escuchar respuestas
  startListening() {
    if (this.isRunning) {
      console.log('ℹ️ Listener IMAP ya está ejecutándose');
      return;
    }

    try {
      this.initializeImap();

      this.imap.once('ready', () => {
        console.log('✅ IMAP conectado. Abriendo INBOX...');
        this.openInbox();
      });

      this.imap.once('error', (err) => {
        console.error('❌ Error IMAP:', err);
        this.isRunning = false;
      });

      this.imap.once('end', () => {
        console.log('⚠️ Conexión IMAP cerrada');
        this.isRunning = false;
      });

      this.imap.connect();
      this.isRunning = true;
      console.log('⏳ Intentando conectar a IMAP...');
    } catch (error) {
      console.error('❌ Error iniciando IMAP:', error);
      this.isRunning = false;
    }
  }

  openInbox() {
    if (!this.imap) {
      console.error('❌ IMAP no está inicializado para abrir INBOX');
      return;
    }

    this.imap.openBox('INBOX', false, (err) => {
      if (err) {
        console.error('❌ Error al abrir INBOX:', err);
        return;
      }

      console.log('✅ INBOX abierto. Escuchando respuestas...');
      this.searchAndProcessResponses();

      this.imap.on('mail', (numNewMsgs) => {
        console.log(`📧 Nuevo correo detectado (${numNewMsgs} mensajes nuevos)`);
        this.searchAndProcessResponses();
      });
    });
  }

  // Buscar y procesar respuestas
  searchAndProcessResponses() {
    if (!this.imap) {
      console.error('❌ IMAP no inicializado');
      return;
    }

    const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // últimos 7 días
    const sinceString = `${sinceDate.getUTCFullYear()}-${String(sinceDate.getUTCMonth() + 1).padStart(2, '0')}-${String(sinceDate.getUTCDate()).padStart(2, '0')}`;

    const onMailResults = async (err, results) => {
      if (err) {
        console.error('❌ Error buscando correos:', err);
        return;
      }

      if ((!results || results.length === 0)) {
        console.log('⚠️ No hay correos UNSEEN, probando ALL (últimos 7 días)...');
        this.imap.search([['SINCE', sinceString]], onMailResultsAll);
        return;
      }

      console.log(`📧 Procesando ${results.length} correos nuevos (UNSEEN)...`);
      this.fetchMessages(results);
    };

    const onMailResultsAll = async (err, results) => {
      if (err) {
        console.error('❌ Error buscando correos ALL:', err);
        return;
      }

      if (!results || results.length === 0) {
        console.log('✅ No hay correos nuevos (SINCE últimos 7 días)');
        return;
      }

      console.log(`📧 Procesando ${results.length} correos (ALL últimos 7 días)...`);
      this.fetchMessages(results);
    };

    this.imap.search(['UNSEEN'], onMailResults);
  }

  fetchMessages(messageIds) {
    const f = this.imap.fetch(messageIds, { bodies: '', markSeen: true });

    f.on('message', (msg, seqno) => {
      console.log(`\n📨 Procesando correo #${seqno}`);

      msg.on('body', (stream, info) => {
        simpleParser(stream, {}, async (err, parsed) => {
          if (err) {
            console.error('❌ Error parseando correo:', err);
            return;
          }

          try {
            const from = parsed.from?.text || '';
            const toList = parsed.to?.value?.map(item => item.address?.toLowerCase?.()).filter(Boolean) || [];
            const subject = parsed.subject || '';
            const text = parsed.text || '';

            console.log(`📧 De: ${from}`);
            console.log(`📧 Para: ${toList.join(', ')}`);
            console.log(`📧 Asunto: ${subject}`);

            // Asegurarse de que la respuesta vaya al buzón del sistema
            const systemEmail = process.env.EMAIL_USER?.toLowerCase();
            if (!toList.includes(systemEmail)) {
              console.warn(`⚠️ Correo no dirigido al buzón del sistema (${systemEmail}) -- ignorando`);
              return;
            }

            const tokenEmail = parsed.headers.get('x-acompaniamiento-email')?.toLowerCase();
            const tokenCargaId = parsed.headers.get('x-acompaniamiento-carga-id');
            const emailMatch = from.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (!emailMatch && !tokenEmail) {
              console.warn('⚠️ No se pudo extraer email del remitente ni token de seguimiento');
              return;
            }

            const studentEmail = tokenEmail || emailMatch[1].toLowerCase();
            let query = `SELECT ec.estudiante_carga_id, ec.carga_id, ec.nombre_completo
               FROM Estudiante_Carga ec
               WHERE LOWER(ec.email) = ? AND ec.estado_seguimiento IN ('enviado','pendiente')`;
            const params = [studentEmail];

            if (tokenCargaId && !isNaN(parseInt(tokenCargaId, 10))) {
              query += ' AND ec.carga_id = ?';
              params.push(parseInt(tokenCargaId, 10));
              console.log(`🔖 Buscando respuesta para carga_id=${tokenCargaId}`);
            }

            query += ' LIMIT 1';

            const [studentRows] = await pool.execute(query, params);

            if (studentRows.length === 0) {
              console.warn(`⚠️ Estudiante con email ${studentEmail} no encontrado o ya respondió${tokenCargaId ? ` en carga ${tokenCargaId}` : ''}`);
              return;
            }

            const student = studentRows[0];
          const motivo = extractInitialStudentResponse(text);
            const fechaRespuesta = new Date();
            try {
              await pool.execute(
                `UPDATE Estudiante_Carga
                 SET estado_seguimiento = 'respondido',
                     fecha_respuesta = ?,
                     motivo_respuesta = ?
                 WHERE estudiante_carga_id = ?`,
                [fechaRespuesta, motivo, student.estudiante_carga_id]
              );
            } catch (errUpdate) {
              if (errUpdate.code === 'WARN_DATA_TRUNCATED' || errUpdate.errno === 1265) {
                console.warn('⚠️ Data truncation en estado_seguimiento. Intentando ALTER TABLE y reintentar...');
                await this.ensureEstadoSeguimientoEnum();
                await pool.execute(
                  `UPDATE Estudiante_Carga
                   SET estado_seguimiento = 'respondido',
                       fecha_respuesta = ?,
                       motivo_respuesta = ?
                   WHERE estudiante_carga_id = ?`,
                  [fechaRespuesta, motivo, student.estudiante_carga_id]
                );
              } else {
                throw errUpdate;
              }
            }

            try {
              const [cargaRows] = await pool.execute(
                `SELECT profesional_id FROM Carga_Masiva WHERE carga_id = ? LIMIT 1`,
                [student.carga_id]
              );
              const profesionalId = cargaRows[0]?.profesional_id || null;
              const tipoContacto = await this.normalizeInsertValue('seguimiento', 'tipo_contacto', 'email');

              await pool.execute(
                `INSERT INTO seguimiento (fecha_seguimiento, tipo_contacto, resumen_accion, alerta_id, profesional_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [fechaRespuesta, tipoContacto, `Respuesta de estudiante: ${motivo.substring(0, 200)}`, null, profesionalId]
              );
            } catch (err) {
              console.warn('⚠️ No se pudo insertar en tabla seguimiento (puede no existir o el campo no aceptar el valor):', err.message);
            }

            try {
              const tipoIntento = await this.normalizeInsertValue('intento_contacto', 'tipo', 'respuesta');
              await pool.execute(
                `INSERT INTO intento_contacto (estudiante_carga_id, fecha_envio, tipo, correo_enviado)
                 VALUES (?, ?, ?, ?)`,
                [student.estudiante_carga_id, fechaRespuesta, tipoIntento, studentEmail]
              );
            } catch (err) {
              console.warn('⚠️ No se pudo insertar en intento_contacto (puede no existir o el campo no aceptar el valor):', err.message);
            }

            await pool.execute(
              `INSERT INTO Auditoria_Carga (carga_id, evento, detalles, fecha_evento)
               VALUES (?, 'RESPUESTA_AUTOMATICA', ?, NOW())`,
              [student.carga_id, JSON.stringify({ email: studentEmail, asunto: subject, resumen: motivo.substring(0, 100) })]
            );

            console.log(`✅ Respuesta guardada para ${student.nombre_completo} (email: ${studentEmail})`);

            this.imap.setFlags(seqno, ['\\Seen'], (errFlag) => {
              if (errFlag) console.error('❌ Error marcando como leído:', errFlag);
            });

          } catch (error) {
            console.error('❌ Error procesando respuesta:', error);
          }
        });
      });
    });

    f.on('error', (err) => {
      console.error('❌ Error durante fetch:', err);
    });

    f.on('end', () => {
      console.log('✅ Procesamiento completado');
    });
  }

  async ensureEstadoSeguimientoEnum() {
    try {
      await pool.execute(
        `ALTER TABLE Estudiante_Carga
         MODIFY estado_seguimiento ENUM('pendiente','enviado','respondido','no_responde','no_contactado') NOT NULL DEFAULT 'pendiente'`
      );
      console.log('✅ Estado seguimiento actualizado con valores adecuados');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
        // ya existe, no importa
        return;
      }
      console.warn('⚠️ No se pudo actualizar estado_seguimiento:', err.message);
    }
  }

  // Detener el servicio
  stop() {
    if (this.imap) {
      this.imap.closeBox((err) => {
        if (err) console.error('Error cerrando INBOX:', err);
        this.imap.end();
        this.isRunning = false;
        console.log('🛑 Servicio de respuestas detenido');
      });
    }
  }

  // Obtener estado
  getStatus() {
    return {
      isRunning: this.isRunning,
      timestamp: new Date().toISOString(),
      emailUser: process.env.EMAIL_USER
    };
  }
}

module.exports = new EmailResponseService();
