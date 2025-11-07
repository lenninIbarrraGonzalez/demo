'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Search, FileText, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { EstadoInspeccion } from '@/types';
import type { Inspeccion, Vehiculo, Taller, Usuario, Informe } from '@/types';

interface InspeccionWithDetails extends Inspeccion {
  vehiculo: Vehiculo | null;
  taller: Taller | null;
  tecnico: Usuario | null;
  informe: Informe | null;
}

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<InspeccionWithDetails[]>([]);
  const [filteredInspecciones, setFilteredInspecciones] = useState<InspeccionWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInspecciones = () => {
    const data = storage.getAllInspecciones();
    const inspeccionesWithDetails = data
      .filter(i => i.estado === EstadoInspeccion.COMPLETADA || i.estado === EstadoInspeccion.APROBADA)
      .map(i => {
        const vehiculo = storage.getVehiculoById(i.vehiculoId);
        const taller = vehiculo ? storage.getTallerById(vehiculo.tallerId) : null;
        const tecnico = storage.getUsuarioById(i.tecnicoId);
        const informe = storage.getInformeByInspeccionId(i.id);
        return {
          ...i,
          vehiculo,
          taller,
          tecnico,
          informe,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setInspecciones(inspeccionesWithDetails);
    setFilteredInspecciones(inspeccionesWithDetails);
  };

  useEffect(() => {
    loadInspecciones();
  }, []);

  useEffect(() => {
    let filtered = inspecciones;

    if (searchTerm.trim()) {
      filtered = filtered.filter(i =>
        i.vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.taller?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.tecnico?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.tecnico?.apellido.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInspecciones(filtered);
  }, [searchTerm, inspecciones]);

  const completadas = inspecciones.length;
  const conInforme = inspecciones.filter(i => i.informe).length;
  const sinInforme = inspecciones.filter(i => !i.informe).length;

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Inspecciones">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
            <CheckCircle className="h-8 w-8 md:h-10 md:w-10" />
            Inspecciones Completadas
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Revisa y genera informes de las inspecciones
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{completadas}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total Completadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-completed-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-completed-fg))]">{conInforme}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Con Informe</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-pending-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-pending-fg))]">{sinInforme}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sin Informe</p>
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
                placeholder="Buscar por placa, taller o técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 md:h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Inspecciones */}
        <Card>
          <CardHeader>
            <CardTitle>Inspecciones</CardTitle>
            <CardDescription>
              {filteredInspecciones.length} inspeccion{filteredInspecciones.length !== 1 ? 'es' : ''} encontrada{filteredInspecciones.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInspecciones.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  {searchTerm ? 'No se encontraron inspecciones' : 'No hay inspecciones completadas'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInspecciones.map((inspeccion) => (
                  <Card key={inspeccion.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Información */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">
                              {inspeccion.vehiculo?.placa || 'Vehículo desconocido'}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Completada
                            </Badge>
                            {inspeccion.informe && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Con Informe
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                            {inspeccion.vehiculo && (
                              <p>
                                <span className="font-medium">Vehículo:</span>{' '}
                                {inspeccion.vehiculo.marca} {inspeccion.vehiculo.modelo} ({inspeccion.vehiculo.año})
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Taller:</span>{' '}
                              {inspeccion.taller?.nombre || 'Desconocido'}
                            </p>
                            <p>
                              <span className="font-medium">Técnico:</span>{' '}
                              {inspeccion.tecnico ? `${inspeccion.tecnico.nombre} ${inspeccion.tecnico.apellido}` : 'Desconocido'}
                            </p>
                            <p>
                              <span className="font-medium">Completada:</span>{' '}
                              {new Date(inspeccion.fechaCompletada || inspeccion.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-2">
                          <Link href={`/super-admin/inspecciones/${inspeccion.id}`}>
                            <Button size="tablet" className="w-full gap-2">
                              <Eye className="h-4 w-4" />
                              Ver Detalles
                            </Button>
                          </Link>
                          {inspeccion.informe && (
                            <Link href={`/super-admin/informes/${inspeccion.informe.id}`}>
                              <Button variant="outline" size="tablet" className="w-full gap-2">
                                <FileText className="h-4 w-4" />
                                Ver Informe
                              </Button>
                            </Link>
                          )}
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
