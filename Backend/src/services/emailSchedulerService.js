// src/services/emailSchedulerService.js
const cron = require('node-cron');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

class EmailSchedulerService {
  constructor() {
    this.scheduledJobs = new Map(); // carga_id -> cron job
  }

  // Iniciar scheduler para una carga específica
  startSchedulerForCarga(cargaId) {
    if (this.scheduledJobs.has(cargaId)) {
      console.log(`⏰ Scheduler ya activo para carga #${cargaId}`);
      return;
    }

    console.log(`⏰ Iniciando scheduler diario para carga #${cargaId} (8 días)`);

    // Programar envío diario a las 9:00 AM
    const job = cron.schedule('0 9 * * *', async () => {
      try {
        await this.sendDailyEmails(cargaId);
      } catch (error) {
        console.error(`❌ Error en scheduler para carga #${cargaId}:`, error);
      }
    }, {
      scheduled: false // No iniciar automáticamente
    });

    this.scheduledJobs.set(cargaId, job);
    job.start();

    console.log(`✅ Scheduler iniciado para carga #${cargaId}`);
  }

  // Detener scheduler para una carga
  stopSchedulerForCarga(cargaId) {
    const job = this.scheduledJobs.get(cargaId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(cargaId);
      console.log(`🛑 Scheduler detenido para carga #${cargaId}`);
    }
  }

  // Enviar correos diarios
  async sendDailyEmails(cargaId) {
    try {
      console.log(`📧 [Carga #${cargaId}] Verificando envíos diarios...`);

      // Obtener estudiantes que necesitan envío (no han respondido y menos de 8 intentos)
      const [students] = await pool.execute(
        `SELECT estudiante_carga_id, nombre_completo, email, intentos_enviados
         FROM Estudiante_Carga
         WHERE carga_id = ? AND estado_seguimiento IN ('pendiente', 'enviado') AND intentos_enviados < 8`,
        [cargaId]
      );

      if (students.length === 0) {
        console.log(`✅ [Carga #${cargaId}] No hay estudiantes pendientes de envío`);
        this.stopSchedulerForCarga(cargaId); // Detener si no hay más
        return;
      }

      console.log(`📧 [Carga #${cargaId}] Enviando a ${students.length} estudiantes...`);

      // Configurar transporter
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      let sentCount = 0;
      let errorCount = 0;

      for (const student of students) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: student.email,
            subject: `Recordatorio: Te esperamos en tu proceso de acompañamiento estudiantil (Día ${student.intentos_enviados + 1})`,
            headers: {
              'X-Acompaniamiento-Email': student.email,
              'X-Acompaniamiento-Carga-Id': String(cargaId)
            },
            html: `
              <h1>¡Hola ${student.nombre_completo.split(' ')[0]}! 😊</h1>
              <p>Este es un recordatorio amigable sobre el proceso de acompañamiento estudiantil.</p>
              <p>Hemos intentado contactarte en ${student.intentos_enviados} ocasiones anteriores.</p>
              <p>Por favor, responde a este correo indicando tu situación actual.</p>
              <p>¡Estamos aquí para apoyarte!</p>
              <hr>
              <p><strong>Saludos,</strong><br>Equipo de Acompañamiento Estudiantil</p>
            `,
            text: `Hola ${student.nombre_completo.split(' ')[0]},\n\nEste es un recordatorio sobre el proceso de acompañamiento estudiantil. Hemos intentado contactarte en ${student.intentos_enviados} ocasiones anteriores.\n\nPor favor, responde indicando tu situación actual.\n\n¡Estamos aquí para apoyarte!\n\nSaludos,\nEquipo de Acompañamiento Estudiantil`
          };

          await transporter.sendMail(mailOptions);

          // Actualizar intentos
          const newIntentos = student.intentos_enviados + 1;
          const newEstado = newIntentos >= 8 ? 'no_responde' : 'enviado';

          await pool.execute(
            `UPDATE Estudiante_Carga
             SET intentos_enviados = ?, estado_seguimiento = ?
             WHERE estudiante_carga_id = ?`,
            [newIntentos, newEstado, student.estudiante_carga_id]
          );

          sentCount++;
          console.log(`✅ Correo enviado a: ${student.email} (intento ${newIntentos})`);

        } catch (error) {
          console.error(`❌ Error enviando a ${student.email}:`, error.message);
          errorCount++;
        }
      }

      // Registrar en auditoría
      await pool.execute(
        `INSERT INTO Auditoria_Carga (carga_id, evento, detalles, fecha_evento)
         VALUES (?, 'ENVIO_DIARIO', ?, NOW())`,
        [cargaId, JSON.stringify({ sentCount, errorCount, total: students.length })]
      );

      console.log(`📊 [Carga #${cargaId}] Envío diario completado: ${sentCount} enviados, ${errorCount} errores`);

      // Si todos han alcanzado 8 intentos, detener scheduler
      const [remaining] = await pool.execute(
        `SELECT COUNT(*) as count FROM Estudiante_Carga
         WHERE carga_id = ? AND estado_seguimiento IN ('pendiente', 'enviado')`,
        [cargaId]
      );

      if (remaining[0].count === 0) {
        console.log(`✅ [Carga #${cargaId}] Todos los estudiantes han completado el proceso`);
        this.stopSchedulerForCarga(cargaId);
      }

    } catch (error) {
      console.error(`❌ Error en sendDailyEmails para carga #${cargaId}:`, error);
    }
  }

  // Obtener estado de schedulers
  getStatus() {
    return {
      activeSchedulers: Array.from(this.scheduledJobs.keys()),
      count: this.scheduledJobs.size
    };
  }

  // Detener todos los schedulers
  stopAll() {
    for (const [cargaId, job] of this.scheduledJobs) {
      job.stop();
      console.log(`🛑 Scheduler detenido para carga #${cargaId}`);
    }
    this.scheduledJobs.clear();
  }
}

module.exports = new EmailSchedulerService();