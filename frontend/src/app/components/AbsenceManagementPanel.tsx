import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, FileText, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// Tipos
type Taxonomy = {
  id: string;
  name: string;
  createdAt: string;
};

type Category = {
  id: string;
  taxonomyId: string;
  name: string;
  description: string;
  requiresProfessional: boolean;
};

type Action = {
  id: string;
  taxonomyId: string;
  name: string;
  description: string;
  autoSendToProfessional: boolean;
};

type Resource = {
  id: string;
  actionId: string;
  name: string;
  type: 'document' | 'pdf' | 'presentation';
  url: string;
  description: string;
};

export function AbsenceManagementPage() {
  const [activeTab, setActiveTab] = useState<'taxonomies' | 'categories' | 'actions' | 'resources'>(
    'taxonomies'
  );

  // Estado para taxonomías
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [newTaxonomy, setNewTaxonomy] = useState('');
  const [editingTaxonomy, setEditingTaxonomy] = useState<string | null>(null);
  const [editTaxonomyName, setEditTaxonomyName] = useState('');

  // Estado para categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    taxonomyId: '',
    name: '',
    description: '',
    requiresProfessional: false,
  });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Estado para acciones
  const [actions, setActions] = useState<Action[]>([]);
  const [newAction, setNewAction] = useState<Partial<Action>>({
    taxonomyId: '',
    name: '',
    description: '',
    autoSendToProfessional: false,
  });
  const [editingAction, setEditingAction] = useState<string | null>(null);

  // Estado para recursos
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    actionId: '',
    name: '',
    type: 'document',
    url: '',
    description: '',
  });
  const [editingResource, setEditingResource] = useState<string | null>(null);

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const savedTaxonomies = localStorage.getItem('absenceTaxonomies');
    const savedCategories = localStorage.getItem('absenceCategories');
    const savedActions = localStorage.getItem('absenceActions');
    const savedResources = localStorage.getItem('absenceResources');

    if (savedTaxonomies) setTaxonomies(JSON.parse(savedTaxonomies));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedActions) setActions(JSON.parse(savedActions));
    if (savedResources) setResources(JSON.parse(savedResources));
  }, []);

  // Guardar en localStorage cuando cambian los datos
  useEffect(() => {
    localStorage.setItem('absenceTaxonomies', JSON.stringify(taxonomies));
  }, [taxonomies]);

  useEffect(() => {
    localStorage.setItem('absenceCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('absenceActions', JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    localStorage.setItem('absenceResources', JSON.stringify(resources));
  }, [resources]);

  // Funciones para taxonomías
  const addTaxonomy = () => {
    if (newTaxonomy.trim()) {
      const taxonomy: Taxonomy = {
        id: Date.now().toString(),
        name: newTaxonomy,
        createdAt: new Date().toISOString(),
      };
      setTaxonomies([...taxonomies, taxonomy]);
      setNewTaxonomy('');
    }
  };

  const deleteTaxonomy = (id: string) => {
    if (
      confirm(
        '¿Estás seguro de eliminar esta taxonomía? Se eliminarán también todas sus categorías y acciones asociadas.'
      )
    ) {
      setTaxonomies(taxonomies.filter((t) => t.id !== id));
      setCategories(categories.filter((c) => c.taxonomyId !== id));
      setActions(actions.filter((a) => a.taxonomyId !== id));
    }
  };

  const updateTaxonomy = (id: string) => {
    setTaxonomies(taxonomies.map((t) => (t.id === id ? { ...t, name: editTaxonomyName } : t)));
    setEditingTaxonomy(null);
    setEditTaxonomyName('');
  };

  // Funciones para categorías
  const addCategory = () => {
    if (newCategory.name && newCategory.taxonomyId) {
      const category: Category = {
        id: Date.now().toString(),
        taxonomyId: newCategory.taxonomyId,
        name: newCategory.name,
        description: newCategory.description || '',
        requiresProfessional: newCategory.requiresProfessional || false,
      };
      setCategories([...categories, category]);
      setNewCategory({
        taxonomyId: '',
        name: '',
        description: '',
        requiresProfessional: false,
      });
    }
  };

  const deleteCategory = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Funciones para acciones
  const addAction = () => {
    if (newAction.name && newAction.taxonomyId) {
      const action: Action = {
        id: Date.now().toString(),
        taxonomyId: newAction.taxonomyId,
        name: newAction.name,
        description: newAction.description || '',
        autoSendToProfessional: newAction.autoSendToProfessional || false,
      };
      setActions([...actions, action]);
      setNewAction({
        taxonomyId: '',
        name: '',
        description: '',
        autoSendToProfessional: false,
      });
    }
  };

  const deleteAction = (id: string) => {
    if (
      confirm(
        '¿Estás seguro de eliminar esta acción? Se eliminarán también todos sus recursos asociados.'
      )
    ) {
      setActions(actions.filter((a) => a.id !== id));
      setResources(resources.filter((r) => r.actionId !== id));
    }
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setActions(actions.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  // Funciones para recursos
  const addResource = () => {
    if (newResource.name && newResource.actionId && newResource.url) {
      const resource: Resource = {
        id: Date.now().toString(),
        actionId: newResource.actionId,
        name: newResource.name,
        type: newResource.type || 'document',
        url: newResource.url,
        description: newResource.description || '',
      };
      setResources([...resources, resource]);
      setNewResource({
        actionId: '',
        name: '',
        type: 'document',
        url: '',
        description: '',
      });
    }
  };

  const deleteResource = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este recurso?')) {
      setResources(resources.filter((r) => r.id !== id));
    }
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(resources.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="mb-2" style={{ color: '#2563EB' }}>
          Gestión de Ausentismos
        </h1>
        <p style={{ color: '#64748B' }}>
          Administra taxonomías, categorías, acciones y recursos para ausentismos estudiantiles
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b pb-3">
        <button
          onClick={() => setActiveTab('taxonomies')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'taxonomies'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          1. Taxonomías
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          2. Categorías
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'actions'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          3. Acciones
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          4. Repositorio
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Tab: Taxonomías */}
        {activeTab === 'taxonomies' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nueva Taxonomía</CardTitle>
                <CardDescription>
                  Las taxonomías son los tipos principales de ausentismos (ej: Salud, Familiar,
                  Académico)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de la taxonomía"
                    value={newTaxonomy}
                    onChange={(e) => setNewTaxonomy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTaxonomy()}
                  />
                  <Button onClick={addTaxonomy}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxonomías Existentes ({taxonomies.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {taxonomies.length === 0 ? (
                  <p className="text-center py-8" style={{ color: '#64748B' }}>
                    No hay taxonomías creadas. Agrega la primera taxonomía arriba.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {taxonomies.map((taxonomy) => (
                      <div
                        key={taxonomy.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        {editingTaxonomy === taxonomy.id ? (
                          <div className="flex-1 flex gap-2 mr-2">
                            <Input
                              value={editTaxonomyName}
                              onChange={(e) => setEditTaxonomyName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && updateTaxonomy(taxonomy.id)}
                            />
                            <Button size="sm" onClick={() => updateTaxonomy(taxonomy.id)}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTaxonomy(null);
                                setEditTaxonomyName('');
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p style={{ color: '#0F172A' }}>{taxonomy.name}</p>
                              <p className="text-sm" style={{ color: '#64748B' }}>
                                Creado: {new Date(taxonomy.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingTaxonomy(taxonomy.id);
                                  setEditTaxonomyName(taxonomy.name);
                                }}
                                className="p-2 rounded hover:bg-blue-100 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" style={{ color: '#2563EB' }} />
                              </button>
                              <button
                                onClick={() => deleteTaxonomy(taxonomy.id)}
                                className="p-2 rounded hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Categorías */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nueva Categoría</CardTitle>
                <CardDescription>
                  Crea categorías específicas para cada taxonomía con su descripción y si requiere
                  derivación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taxonomía</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={newCategory.taxonomyId}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, taxonomyId: e.target.value })
                      }
                    >
                      <option value="">Selecciona una taxonomía</option>
                      {taxonomies.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre de la Categoría</Label>
                    <Input
                      placeholder="ej: Enfermedad Crónica"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 p-2 min-h-[80px]"
                      placeholder="Describe cuándo aplicar esta categoría..."
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresProfessional"
                      checked={newCategory.requiresProfessional}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, requiresProfessional: e.target.checked })
                      }
                    />
                    <Label htmlFor="requiresProfessional">
                      Requiere derivación a profesional de bienestar
                    </Label>
                  </div>
                  <Button
                    onClick={addCategory}
                    disabled={!newCategory.name || !newCategory.taxonomyId}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Categoría
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorías Existentes ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-center py-8" style={{ color: '#64748B' }}>
                    No hay categorías creadas. Agrega la primera categoría arriba.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {taxonomies.map((taxonomy) => {
                      const taxonomyCategories = categories.filter(
                        (c) => c.taxonomyId === taxonomy.id
                      );
                      if (taxonomyCategories.length === 0) return null;

                      return (
                        <div key={taxonomy.id}>
                          <h3 className="font-medium mb-2" style={{ color: '#2563EB' }}>
                            {taxonomy.name}
                          </h3>
                          <div className="space-y-2 ml-4">
                            {taxonomyCategories.map((category) => (
                              <div
                                key={category.id}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p style={{ color: '#0F172A' }}>{category.name}</p>
                                    <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                                      {category.description}
                                    </p>
                                    {category.requiresProfessional && (
                                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                        <Settings className="w-3 h-3" />
                                        Requiere profesional
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="p-2 rounded hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Acciones */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nueva Acción</CardTitle>
                <CardDescription>
                  Define acciones específicas a tomar según la taxonomía del ausentismo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taxonomía</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={newAction.taxonomyId}
                      onChange={(e) => setNewAction({ ...newAction, taxonomyId: e.target.value })}
                    >
                      <option value="">Selecciona una taxonomía</option>
                      {taxonomies.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre de la Acción</Label>
                    <Input
                      placeholder="ej: Contactar apoderado"
                      value={newAction.name}
                      onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción de la Acción</Label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 p-2 min-h-[80px]"
                      placeholder="Describe los pasos a seguir..."
                      value={newAction.description}
                      onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoSendToProfessional"
                      checked={newAction.autoSendToProfessional}
                      onChange={(e) =>
                        setNewAction({ ...newAction, autoSendToProfessional: e.target.checked })
                      }
                    />
                    <Label htmlFor="autoSendToProfessional">
                      Enviar automáticamente a profesional de bienestar
                    </Label>
                  </div>
                  <Button onClick={addAction} disabled={!newAction.name || !newAction.taxonomyId}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Acción
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Existentes ({actions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {actions.length === 0 ? (
                  <p className="text-center py-8" style={{ color: '#64748B' }}>
                    No hay acciones creadas. Agrega la primera acción arriba.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {taxonomies.map((taxonomy) => {
                      const taxonomyActions = actions.filter((a) => a.taxonomyId === taxonomy.id);
                      if (taxonomyActions.length === 0) return null;

                      return (
                        <div key={taxonomy.id}>
                          <h3 className="font-medium mb-2" style={{ color: '#2563EB' }}>
                            {taxonomy.name}
                          </h3>
                          <div className="space-y-2 ml-4">
                            {taxonomyActions.map((action) => (
                              <div
                                key={action.id}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p style={{ color: '#0F172A' }}>{action.name}</p>
                                    <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                                      {action.description}
                                    </p>
                                    {action.autoSendToProfessional && (
                                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                        <Settings className="w-3 h-3" />
                                        Envío automático a profesional
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteAction(action.id)}
                                    className="p-2 rounded hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Repositorio de Recursos */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Recurso</CardTitle>
                <CardDescription>
                  Agrega documentos, PDFs o presentaciones asociados a acciones específicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Acción Asociada</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={newResource.actionId}
                      onChange={(e) => setNewResource({ ...newResource, actionId: e.target.value })}
                    >
                      <option value="">Selecciona una acción</option>
                      {actions.map((action) => {
                        const taxonomy = taxonomies.find((t) => t.id === action.taxonomyId);
                        return (
                          <option key={action.id} value={action.id}>
                            {taxonomy?.name} - {action.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre del Recurso</Label>
                    <Input
                      placeholder="ej: Guía de contención emocional"
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Recurso</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={newResource.type}
                      onChange={(e) =>
                        setNewResource({ ...newResource, type: e.target.value as Resource['type'] })
                      }
                    >
                      <option value="document">Documento</option>
                      <option value="pdf">PDF</option>
                      <option value="presentation">Presentación</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL del Recurso</Label>
                    <Input
                      placeholder="https://..."
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 p-2 min-h-[80px]"
                      placeholder="Describe brevemente el contenido del recurso..."
                      value={newResource.description}
                      onChange={(e) =>
                        setNewResource({ ...newResource, description: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={addResource}
                    disabled={!newResource.name || !newResource.actionId || !newResource.url}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Recurso
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repositorio de Recursos ({resources.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {resources.length === 0 ? (
                  <p className="text-center py-8" style={{ color: '#64748B' }}>
                    No hay recursos en el repositorio. Agrega el primer recurso arriba.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {actions.map((action) => {
                      const actionResources = resources.filter((r) => r.actionId === action.id);
                      if (actionResources.length === 0) return null;

                      const taxonomy = taxonomies.find((t) => t.id === action.taxonomyId);

                      return (
                        <div key={action.id}>
                          <h3 className="font-medium mb-2" style={{ color: '#2563EB' }}>
                            {taxonomy?.name} → {action.name}
                          </h3>
                          <div className="space-y-2 ml-4">
                            {actionResources.map((resource) => (
                              <div
                                key={resource.id}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileText className="w-4 h-4" style={{ color: '#2563EB' }} />
                                      <p style={{ color: '#0F172A' }}>{resource.name}</p>
                                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                        {resource.type}
                                      </span>
                                    </div>
                                    {resource.description && (
                                      <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                                        {resource.description}
                                      </p>
                                    )}
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm mt-2 inline-block underline"
                                      style={{ color: '#2563EB' }}
                                    >
                                      Abrir recurso →
                                    </a>
                                  </div>
                                  <button
                                    onClick={() => deleteResource(resource.id)}
                                    className="p-2 rounded hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
