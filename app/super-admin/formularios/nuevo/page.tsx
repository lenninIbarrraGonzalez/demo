'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, GripVertical, Eye } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import { TipoCampo, OperadorCondicional } from '@/types';
import type { CampoFormulario, LogicaCondicional, ValidacionCampo } from '@/types';

export default function NuevoFormularioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metadatos del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [version, setVersion] = useState('1.0.0');

  // Campos del formulario
  const [campos, setCampos] = useState<CampoFormulario[]>([]);

  // Campo en edición
  const [campoEnEdicion, setCampoEnEdicion] = useState<string | null>(null);

  const agregarCampo = () => {
    const nuevoCampo: CampoFormulario = {
      id: `campo_${Date.now()}`,
      tipo: TipoCampo.TEXT,
      label: 'Nuevo Campo',
      required: false,
      orden: campos.length,
    };
    setCampos([...campos, nuevoCampo]);
    setCampoEnEdicion(nuevoCampo.id);
  };

  const eliminarCampo = (id: string) => {
    setCampos(campos.filter(c => c.id !== id));
    if (campoEnEdicion === id) {
      setCampoEnEdicion(null);
    }
  };

  const actualizarCampo = (id: string, updates: Partial<CampoFormulario>) => {
    setCampos(campos.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const moverCampo = (index: number, direccion: 'arriba' | 'abajo') => {
    if (
      (direccion === 'arriba' && index === 0) ||
      (direccion === 'abajo' && index === campos.length - 1)
    ) {
      return;
    }

    const nuevosCampos = [...campos];
    const targetIndex = direccion === 'arriba' ? index - 1 : index + 1;
    [nuevosCampos[index], nuevosCampos[targetIndex]] = [nuevosCampos[targetIndex], nuevosCampos[index]];

    // Actualizar orden
    nuevosCampos.forEach((campo, idx) => {
      campo.orden = idx;
    });

    setCampos(nuevosCampos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!nombre.trim()) {
        toast.error('El nombre es obligatorio');
        setIsSubmitting(false);
        return;
      }

      if (campos.length === 0) {
        toast.error('Debes agregar al menos un campo');
        setIsSubmitting(false);
        return;
      }

      if (!user?.id) {
        toast.error('Usuario no autenticado');
        setIsSubmitting(false);
        return;
      }

      storage.createPlantillaFormulario({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        version: version.trim(),
        campos: campos,
        activo: true,
        createdBy: user.id,
      });

      toast.success('Formulario creado exitosamente');
      router.push('/super-admin/formularios');
    } catch (error) {
      console.error('Error creating formulario:', error);
      toast.error('Error al crear el formulario');
      setIsSubmitting(false);
    }
  };

  const campoSeleccionado = campoEnEdicion ? campos.find(c => c.id === campoEnEdicion) : null;

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Nuevo Formulario">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/super-admin/formularios">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
              Nuevo Formulario de Inspección
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Crea una plantilla de formulario para inspección de cilindros
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel izquierdo - Configuración */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Datos básicos del formulario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">
                      Nombre del Formulario <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Inspección Visual de Cilindros GNV"
                      required
                      className="h-12 md:h-14"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el propósito de este formulario..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Versión</Label>
                    <Input
                      id="version"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="h-12 md:h-14"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Campos del Formulario */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Campos del Formulario</CardTitle>
                      <CardDescription>
                        {campos.length} campo{campos.length !== 1 ? 's' : ''} configurado{campos.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <Button type="button" onClick={agregarCampo} size="tablet" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Campo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {campos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <p className="text-[hsl(var(--muted-foreground))] mb-4">
                        No hay campos en este formulario
                      </p>
                      <Button type="button" onClick={agregarCampo} size="tablet">
                        <Plus className="h-5 w-5 mr-2" />
                        Agregar Primer Campo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {campos.map((campo, index) => (
                        <div
                          key={campo.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            campoEnEdicion === campo.id
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
                          }`}
                          onClick={() => setCampoEnEdicion(campo.id)}
                        >
                          <GripVertical className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{campo.label}</span>
                              {campo.required && <span className="text-red-600 text-xs">*</span>}
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {campo.tipo}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                moverCampo(index, 'arriba');
                              }}
                              disabled={index === 0}
                              className="h-8 w-8"
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                moverCampo(index, 'abajo');
                              }}
                              disabled={index === campos.length - 1}
                              className="h-8 w-8"
                            >
                              ↓
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarCampo(campo.id);
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col-reverse md:flex-row gap-3">
                    <Link href="/super-admin/formularios" className="flex-1 md:flex-initial">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full md:w-auto"
                        size="tablet"
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 md:flex-initial md:min-w-[200px] gap-2"
                      size="tablet"
                      disabled={isSubmitting || campos.length === 0}
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Guardando...' : 'Guardar Formulario'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel derecho - Editor de Campo */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {campoSeleccionado ? 'Configurar Campo' : 'Selecciona un Campo'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!campoSeleccionado ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Selecciona un campo de la lista para configurarlo
                        </p>
                      </div>
                    ) : (
                      <EditorCampo
                        campo={campoSeleccionado}
                        campos={campos}
                        onUpdate={(updates) => actualizarCampo(campoSeleccionado.id, updates)}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

// Componente para editar un campo específico
function EditorCampo({
  campo,
  campos,
  onUpdate,
}: {
  campo: CampoFormulario;
  campos: CampoFormulario[];
  onUpdate: (updates: Partial<CampoFormulario>) => void;
}) {
  const tieneOpciones = [TipoCampo.SELECT, TipoCampo.RADIO, TipoCampo.CHECKBOX].includes(campo.tipo);

  return (
    <div className="space-y-4">
      {/* Tipo de Campo */}
      <div className="space-y-2">
        <Label>Tipo de Campo</Label>
        <Select
          value={campo.tipo}
          onValueChange={(value) => onUpdate({ tipo: value as TipoCampo })}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TipoCampo.TEXT}>Texto</SelectItem>
            <SelectItem value={TipoCampo.TEXTAREA}>Área de Texto</SelectItem>
            <SelectItem value={TipoCampo.NUMBER}>Número</SelectItem>
            <SelectItem value={TipoCampo.SELECT}>Selección</SelectItem>
            <SelectItem value={TipoCampo.RADIO}>Radio Buttons</SelectItem>
            <SelectItem value={TipoCampo.CHECKBOX}>Checkbox</SelectItem>
            <SelectItem value={TipoCampo.DATE}>Fecha</SelectItem>
            <SelectItem value={TipoCampo.FILE}>Archivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label>Etiqueta</Label>
        <Input
          value={campo.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Nombre del campo"
          className="h-12"
        />
      </div>

      {/* Required */}
      <div className="flex items-center justify-between">
        <Label>Campo Obligatorio</Label>
        <Switch
          checked={campo.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>

      {/* Opciones (si aplica) */}
      {tieneOpciones && (
        <div className="space-y-2">
          <Label>Opciones (una por línea)</Label>
          <Textarea
            value={campo.opciones?.join('\n') || ''}
            onChange={(e) => onUpdate({ opciones: e.target.value.split('\n').filter(o => o.trim()) })}
            placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
            rows={5}
            className="resize-none"
          />
        </div>
      )}

      {/* Placeholder (solo para text/textarea/number) */}
      {[TipoCampo.TEXT, TipoCampo.TEXTAREA, TipoCampo.NUMBER].includes(campo.tipo) && (
        <div className="space-y-2">
          <Label>Texto de Ayuda (Placeholder)</Label>
          <Input
            value={campo.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Ej: Ingrese el número de serie"
            className="h-12"
          />
        </div>
      )}
    </div>
  );
}
