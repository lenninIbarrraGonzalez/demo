'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Building2, Edit, Trash2, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import type { Taller } from '@/types';

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTalleres, setFilteredTalleres] = useState<Taller[]>([]);

  const loadTalleres = () => {
    const data = storage.getAllTalleres();
    setTalleres(data);
    setFilteredTalleres(data);
  };

  useEffect(() => {
    loadTalleres();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTalleres(talleres);
    } else {
      const filtered = talleres.filter(
        (t) =>
          t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.ruc.includes(searchTerm) ||
          t.responsable.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTalleres(filtered);
    }
  }, [searchTerm, talleres]);

  const handleToggleActivo = (id: string, currentState: boolean) => {
    const updated = storage.updateTaller(id, { activo: !currentState });
    if (updated) {
      toast.success(`Taller ${!currentState ? 'activado' : 'desactivado'} correctamente`);
      loadTalleres();
    } else {
      toast.error('Error al actualizar el taller');
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el taller "${nombre}"?`)) {
      const deleted = storage.deleteTaller(id);
      if (deleted) {
        toast.success('Taller eliminado correctamente');
        loadTalleres();
      } else {
        toast.error('Error al eliminar el taller');
      }
    }
  };

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Gestión de Talleres">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Building2 className="h-8 w-8 md:h-10 md:w-10" />
              Talleres
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Gestiona los talleres registrados en la plataforma
            </p>
          </div>
          <Link href="/super-admin/talleres/nuevo">
            <Button size="tablet" className="w-full md:w-auto gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Taller
            </Button>
          </Link>
        </div>

        {/* Buscador */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Buscar por nombre, RUC o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 md:h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Talleres */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Talleres</CardTitle>
            <CardDescription>
              {filteredTalleres.length} taller{filteredTalleres.length !== 1 ? 'es' : ''} encontrado
              {filteredTalleres.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTalleres.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] text-sm md:text-base">
                  {searchTerm ? 'No se encontraron talleres' : 'No hay talleres registrados'}
                </p>
              </div>
            ) : (
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>RUC</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTalleres.map((taller) => (
                      <TableRow key={taller.id}>
                        <TableCell className="font-medium">{taller.nombre}</TableCell>
                        <TableCell>{taller.ruc}</TableCell>
                        <TableCell>{taller.responsable}</TableCell>
                        <TableCell>{taller.telefono}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={taller.activo}
                              onCheckedChange={() => handleToggleActivo(taller.id, taller.activo)}
                            />
                            <Badge variant={taller.activo ? 'default' : 'secondary'}>
                              {taller.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/super-admin/talleres/${taller.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(taller.id, taller.nombre)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Vista móvil/tablet - Cards */}
            <div className="md:hidden space-y-4">
              {filteredTalleres.map((taller) => (
                <Card key={taller.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">{taller.nombre}</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          RUC: {taller.ruc}
                        </p>
                      </div>
                      <Badge variant={taller.activo ? 'default' : 'secondary'}>
                        {taller.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-[hsl(var(--muted-foreground))]">Responsable:</span>{' '}
                        {taller.responsable}
                      </p>
                      <p>
                        <span className="text-[hsl(var(--muted-foreground))]">Teléfono:</span>{' '}
                        {taller.telefono}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        checked={taller.activo}
                        onCheckedChange={() => handleToggleActivo(taller.id, taller.activo)}
                      />
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        {taller.activo ? 'Desactivar' : 'Activar'}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/super-admin/talleres/${taller.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2" size="tablet">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="gap-2 text-red-600 hover:text-red-700"
                        size="tablet"
                        onClick={() => handleDelete(taller.id, taller.nombre)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
