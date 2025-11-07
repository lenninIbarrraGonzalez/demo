'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Car, Plus, Edit, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import type { Vehiculo, Cilindro } from '@/types';

export default function VehiculoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehiculoId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cilindros, setCilindros] = useState<Cilindro[]>([]);
  const [showCilindroDialog, setShowCilindroDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  }, [vehiculoId, router]);

  const handleAddCilindro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!vehiculoId) return;

      const nuevoCilindro = storage.createCilindro({
        vehiculoId,
        numeroSerie: cilindroForm.numeroSerie,
        capacidad: cilindroForm.capacidad,
        fabricante: cilindroForm.fabricante,
        añoFabricacion: cilindroForm.añoFabricacion,
        ubicacion: cilindroForm.ubicacion,
      });

      toast.success('Cilindro agregado exitosamente');
      setShowCilindroDialog(false);
      setCilindroForm({
        numeroSerie: '',
        capacidad: 80,
        fabricante: '',
        añoFabricacion: new Date().getFullYear(),
        ubicacion: '',
      });
      loadData();
    } catch (error) {
      console.error('Error adding cilindro:', error);
      toast.error('Error al agregar el cilindro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCilindro = (cilindroId: string, numeroSerie: string) => {
    if (confirm(`¿Estás seguro de eliminar el cilindro ${numeroSerie}?`)) {
      const deleted = storage.deleteCilindro(cilindroId);
      if (deleted) {
        toast.success('Cilindro eliminado correctamente');
        loadData();
      } else {
        toast.error('Error al eliminar el cilindro');
      }
    }
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

  if (!vehiculo) {
    return null;
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Detalle del Vehículo">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/taller/vehiculos">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Car className="h-8 w-8 md:h-10 md:w-10" />
              {vehiculo.placa}
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})
            </p>
          </div>
        </div>

        {/* Información del Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Placa</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.placa}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Año</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.año}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Marca</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.marca}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Modelo</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.modelo}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Propietario</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.propietario}</p>
              </div>
              <div>
                <Label className="text-[hsl(var(--muted-foreground))]">Documento</Label>
                <p className="text-lg font-semibold mt-1">{vehiculo.documentoPropietario}</p>
              </div>
              {vehiculo.telefonoPropietario && (
                <div>
                  <Label className="text-[hsl(var(--muted-foreground))]">Teléfono</Label>
                  <p className="text-lg font-semibold mt-1">{vehiculo.telefonoPropietario}</p>
                </div>
              )}
              {vehiculo.emailPropietario && (
                <div>
                  <Label className="text-[hsl(var(--muted-foreground))]">Email</Label>
                  <p className="text-lg font-semibold mt-1">{vehiculo.emailPropietario}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cilindros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cilindros</CardTitle>
                <CardDescription>
                  {cilindros.length} cilindro{cilindros.length !== 1 ? 's' : ''} registrado{cilindros.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button onClick={() => setShowCilindroDialog(true)} size="tablet" className="gap-2">
                <Plus className="h-5 w-5" />
                Agregar Cilindro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cilindros.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[hsl(var(--muted-foreground))] mb-4">
                  No hay cilindros registrados para este vehículo
                </p>
                <Button onClick={() => setShowCilindroDialog(true)} size="tablet">
                  Agregar Primer Cilindro
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cilindros.map((cilindro) => (
                  <Card key={cilindro.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{cilindro.numeroSerie}</h3>
                          <Badge variant="secondary">{cilindro.capacidad}L</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCilindro(cilindro.id, cilindro.numeroSerie)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-[hsl(var(--muted-foreground))]">Fabricante:</span>{' '}
                          {cilindro.fabricante}
                        </p>
                        <p>
                          <span className="text-[hsl(var(--muted-foreground))]">Año:</span>{' '}
                          {cilindro.añoFabricacion}
                        </p>
                        <p>
                          <span className="text-[hsl(var(--muted-foreground))]">Ubicación:</span>{' '}
                          {cilindro.ubicacion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para agregar cilindro */}
        <Dialog open={showCilindroDialog} onOpenChange={setShowCilindroDialog}>
          <DialogContent>
            <form onSubmit={handleAddCilindro}>
              <DialogHeader>
                <DialogTitle>Agregar Cilindro</DialogTitle>
                <DialogDescription>
                  Registra un nuevo cilindro para este vehículo
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
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacidad">Capacidad (L) *</Label>
                    <Input
                      id="capacidad"
                      type="number"
                      value={cilindroForm.capacidad}
                      onChange={(e) => setCilindroForm({ ...cilindroForm, capacidad: parseInt(e.target.value) })}
                      required
                      className="h-12 md:h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="añoFabricacion">Año *</Label>
                    <Input
                      id="añoFabricacion"
                      type="number"
                      value={cilindroForm.añoFabricacion}
                      onChange={(e) => setCilindroForm({ ...cilindroForm, añoFabricacion: parseInt(e.target.value) })}
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
                  onClick={() => setShowCilindroDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Agregando...' : 'Agregar Cilindro'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
