'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Pencil, Copy } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import type { PlantillaFormulario } from '@/types';

export default function FormulariosPage() {
  const [formularios, setFormularios] = useState<PlantillaFormulario[]>([]);
  const [filteredFormularios, setFilteredFormularios] = useState<PlantillaFormulario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadFormularios = () => {
    const data = storage.getAllPlantillasFormularios();
    setFormularios(data);
    setFilteredFormularios(data);
  };

  useEffect(() => {
    loadFormularios();
  }, []);

  useEffect(() => {
    let filtered = formularios;

    if (searchTerm.trim()) {
      filtered = filtered.filter(f =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFormularios(filtered);
  }, [searchTerm, formularios]);

  const handleToggleActivo = async (id: string, currentState: boolean) => {
    const updated = storage.updatePlantillaFormulario(id, { activo: !currentState });
    if (updated) {
      toast.success(
        !currentState ? 'Formulario activado exitosamente' : 'Formulario desactivado exitosamente'
      );
      loadFormularios();
    } else {
      toast.error('Error al actualizar el formulario');
    }
  };

  const handleDuplicate = (formulario: PlantillaFormulario) => {
    try {
      const duplicated = storage.createPlantillaFormulario({
        nombre: `${formulario.nombre} (Copia)`,
        descripcion: formulario.descripcion,
        version: '1.0.0',
        campos: formulario.campos,
        activo: false,
        createdBy: formulario.createdBy,
      });

      if (duplicated) {
        toast.success('Formulario duplicado exitosamente');
        loadFormularios();
      }
    } catch (error) {
      console.error('Error duplicating formulario:', error);
      toast.error('Error al duplicar el formulario');
    }
  };

  const activosCount = formularios.filter(f => f.activo).length;
  const inactivosCount = formularios.filter(f => !f.activo).length;

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Formularios">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <FileText className="h-8 w-8 md:h-10 md:w-10" />
              Plantillas de Formularios
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Gestiona las plantillas para inspección de cilindros
            </p>
          </div>
          <Link href="/super-admin/formularios/nuevo">
            <Button size="tablet" className="w-full md:w-auto gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Formulario
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{formularios.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total Formularios</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-completed-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-completed-fg))]">{activosCount}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-600">{inactivosCount}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Inactivos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Buscar formularios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 md:h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Formularios */}
        <Card>
          <CardHeader>
            <CardTitle>Formularios</CardTitle>
            <CardDescription>
              {filteredFormularios.length} formulario{filteredFormularios.length !== 1 ? 's' : ''} encontrado{filteredFormularios.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFormularios.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] mb-4">
                  {searchTerm ? 'No se encontraron formularios' : 'No hay formularios registrados'}
                </p>
                {!searchTerm && (
                  <Link href="/super-admin/formularios/nuevo">
                    <Button size="tablet">
                      <Plus className="h-5 w-5 mr-2" />
                      Crear Primer Formulario
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFormularios.map((formulario) => (
                  <Card key={formulario.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Información */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{formulario.nombre}</h3>
                            <Badge variant={formulario.activo ? 'default' : 'secondary'}>
                              {formulario.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              v{formulario.version}
                            </Badge>
                          </div>

                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {formulario.descripcion}
                          </p>

                          <div className="flex items-center gap-4 text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                            <span>{formulario.campos.length} campo{formulario.campos.length !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>
                              Creado: {new Date(formulario.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-3 md:items-end">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                              {formulario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <Switch
                              checked={formulario.activo}
                              onCheckedChange={() => handleToggleActivo(formulario.id, formulario.activo)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="tablet"
                              className="gap-2"
                              onClick={() => handleDuplicate(formulario)}
                            >
                              <Copy className="h-4 w-4" />
                              Duplicar
                            </Button>
                            <Link href={`/super-admin/formularios/${formulario.id}`}>
                              <Button variant="outline" size="tablet" className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Editar
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
