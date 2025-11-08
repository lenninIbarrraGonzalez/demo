'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Car, Plus, Edit, Trash2, Wrench } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import type { Vehiculo, Cilindro } from '@/types';

export default function CilindrosPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehiculoId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cilindros, setCilindros] = useState<Cilindro[]>([]);
  const [showCilindroDialog, setShowCilindroDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCilindro, setEditingCilindro] = useState<Cilindro | null>(null);
  const [cilindroToDelete, setCilindroToDelete] = useState<{ id: string; numeroSerie: string } | null>(null);

  const [cilindroForm, setCilindroForm] = useState({
    numeroSerie: '',
    capacidad: 80,
    fabricante: '',
    añoFabricacion: new Date().getFullYear(),
    ubicacion: '',
  });

  const loadData = () => {
    if (!vehiculoId) return;

    const vehiculoData = storage.getVehiculoById(vehiculoId);
    if (vehiculoData) {
      // Verificar que el vehículo pertenece al taller del usuario
      if (user?.tallerId && vehiculoData.tallerId !== user.tallerId) {
        toast.error('No tienes acceso a este vehículo');
        router.push('/taller/vehiculos');
        return;
      }

      setVehiculo(vehiculoData);
      const cilindrosData = storage.getAllCilindros(vehiculoId);
      setCilindros(cilindrosData);
    } else {
      toast.error('Vehículo no encontrado');
      router.push('/taller/vehiculos');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [vehiculoId, user]);

  const resetForm = () => {
    setCilindroForm({
      numeroSerie: '',
      capacidad: 80,
      fabricante: '',
      añoFabricacion: new Date().getFullYear(),
      ubicacion: '',
    });
    setEditingCilindro(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setShowCilindroDialog(true);
  };

  const handleOpenEditDialog = (cilindro: Cilindro) => {
    setEditingCilindro(cilindro);
    setCilindroForm({
      numeroSerie: cilindro.numeroSerie,
      capacidad: cilindro.capacidad,
      fabricante: cilindro.fabricante,
      añoFabricacion: cilindro.añoFabricacion,
      ubicacion: cilindro.ubicacion,
    });
    setShowCilindroDialog(true);
  };

  const handleSubmitCilindro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!vehiculoId) return;

      if (editingCilindro) {
        // Actualizar cilindro existente
        const updated = storage.updateCilindro(editingCilindro.id, {
          numeroSerie: cilindroForm.numeroSerie,
          capacidad: cilindroForm.capacidad,
          fabricante: cilindroForm.fabricante,
          añoFabricacion: cilindroForm.añoFabricacion,
          ubicacion: cilindroForm.ubicacion,
        });

        if (updated) {
          toast.success('Cilindro actualizado exitosamente');
        } else {
          toast.error('Error al actualizar el cilindro');
        }
      } else {
        // Crear nuevo cilindro
        storage.createCilindro({
          vehiculoId,
          numeroSerie: cilindroForm.numeroSerie,
          capacidad: cilindroForm.capacidad,
          fabricante: cilindroForm.fabricante,
          añoFabricacion: cilindroForm.añoFabricacion,
          ubicacion: cilindroForm.ubicacion,
        });

        toast.success('Cilindro agregado exitosamente');
      }

      setShowCilindroDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving cilindro:', error);
      toast.error('Error al guardar el cilindro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (cilindroId: string, numeroSerie: string) => {
    setCilindroToDelete({ id: cilindroId, numeroSerie });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!cilindroToDelete) return;

    const deleted = storage.deleteCilindro(cilindroToDelete.id);
    if (deleted) {
      toast.success('Cilindro eliminado correctamente');
      loadData();
    } else {
      toast.error('Error al eliminar el cilindro');
    }

    setShowDeleteDialog(false);
    setCilindroToDelete(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout sections={TALLER_NAV} title="Cargando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Cargando datos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vehiculo || !user) {
    return null;
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Gestión de Cilindros">
      <div className="space-y-6 md:space-y-8">
        {/* Header con info del vehículo */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Link href="/taller/vehiculos">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Wrench className="h-8 w-8 md:h-10 md:w-10" />
              Cilindros - {vehiculo.placa}
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})
            </p>
          </div>
          <Button onClick={handleOpenAddDialog} size="tablet" className="gap-2">
            <Plus className="h-5 w-5" />
            Agregar Cilindro
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{cilindros.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total Cilindros</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-completed-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-completed-fg))]">
                  {cilindros.reduce((sum, c) => sum + c.capacidad, 0)}L
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Capacidad Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--primary))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--primary))]">
                  {cilindros.length > 0 ? Math.round(cilindros.reduce((sum, c) => sum + c.capacidad, 0) / cilindros.length) : 0}L
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Capacidad Promedio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Cilindros */}
        <Card>
          <CardHeader>
            <CardTitle>Cilindros Registrados</CardTitle>
            <CardDescription>
              {cilindros.length} cilindro{cilindros.length !== 1 ? 's' : ''} registrado{cilindros.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cilindros.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] mb-4">
                  No hay cilindros registrados para este vehículo
                </p>
                <Button onClick={handleOpenAddDialog} size="tablet" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Agregar Primer Cilindro
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cilindros.map((cilindro) => (
                  <Card key={cilindro.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-3">
                        {/* Header del cilindro */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold break-all">{cilindro.numeroSerie}</h3>
                            <Badge variant="secondary" className="mt-2">
                              {cilindro.capacidad}L
                            </Badge>
                          </div>
                        </div>

                        {/* Información */}
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Fabricante:</span>{' '}
                            <span className="font-medium">{cilindro.fabricante}</span>
                          </div>
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Año:</span>{' '}
                            <span className="font-medium">{cilindro.añoFabricacion}</span>
                          </div>
                          <div>
                            <span className="text-[hsl(var(--muted-foreground))]">Ubicación:</span>{' '}
                            <span className="font-medium">{cilindro.ubicacion}</span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-2 border-t border-[hsl(var(--border))]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(cilindro)}
                            className="flex-1 gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(cilindro.id, cilindro.numeroSerie)}
                            className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para agregar/editar cilindro */}
        <Dialog open={showCilindroDialog} onOpenChange={setShowCilindroDialog}>
          <DialogContent>
            <form onSubmit={handleSubmitCilindro}>
              <DialogHeader>
                <DialogTitle>
                  {editingCilindro ? 'Editar Cilindro' : 'Agregar Cilindro'}
                </DialogTitle>
                <DialogDescription>
                  {editingCilindro
                    ? 'Actualiza la información del cilindro'
                    : 'Registra un nuevo cilindro para este vehículo'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroSerie">Número de Serie *</Label>
                  <Input
                    id="numeroSerie"
                    value={cilindroForm.numeroSerie}
                    onChange={(e) => setCilindroForm({ ...cilindroForm, numeroSerie: e.target.value })}
                    required
                    className="h-12 md:h-14"
                    placeholder="Ej: ABC-12345"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacidad">Capacidad (L) *</Label>
                    <Input
                      id="capacidad"
                      type="number"
                      min="1"
                      value={cilindroForm.capacidad}
                      onChange={(e) => setCilindroForm({ ...cilindroForm, capacidad: parseInt(e.target.value) || 0 })}
                      required
                      className="h-12 md:h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="añoFabricacion">Año *</Label>
                    <Input
                      id="añoFabricacion"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={cilindroForm.añoFabricacion}
                      onChange={(e) => setCilindroForm({ ...cilindroForm, añoFabricacion: parseInt(e.target.value) || new Date().getFullYear() })}
                      required
                      className="h-12 md:h-14"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fabricante">Fabricante *</Label>
                  <Input
                    id="fabricante"
                    value={cilindroForm.fabricante}
                    onChange={(e) => setCilindroForm({ ...cilindroForm, fabricante: e.target.value })}
                    required
                    className="h-12 md:h-14"
                    placeholder="Ej: Worthington, Luxfer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <Input
                    id="ubicacion"
                    value={cilindroForm.ubicacion}
                    onChange={(e) => setCilindroForm({ ...cilindroForm, ubicacion: e.target.value })}
                    placeholder="Ej: Maletero, Bajo chasis"
                    required
                    className="h-12 md:h-14"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCilindroDialog(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? (editingCilindro ? 'Actualizando...' : 'Agregando...')
                    : (editingCilindro ? 'Actualizar' : 'Agregar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación para eliminar */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el cilindro{' '}
                <span className="font-semibold">{cilindroToDelete?.numeroSerie}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCilindroToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
