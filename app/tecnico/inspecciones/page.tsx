'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Search, Eye, Clock, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TECNICO_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import { EstadoInspeccion } from '@/types';
import { ESTADO_INSPECCION_LABELS, ESTADO_INSPECCION_COLORS } from '@/lib/constants/status';
import type { Inspeccion, Vehiculo, Taller, Cilindro, InspeccionCilindro } from '@/types';

interface InspeccionWithDetails extends Inspeccion {
  vehiculo: Vehiculo | null;
  taller: Taller | null;
  cilindros: Cilindro[];
  inspeccionesCilindrosData: InspeccionCilindro[];
  progreso: number;
}

export default function InspeccionesTecnicoPage() {
  const { user } = useAuth();
  const [inspecciones, setInspecciones] = useState<InspeccionWithDetails[]>([]);
  const [filteredInspecciones, setFilteredInspecciones] = useState<InspeccionWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoInspeccion | 'ALL'>('ALL');

  const loadInspecciones = () => {
    if (!user?.id) return;

    // Obtener todas las inspecciones del técnico
    const data = storage.getAllInspecciones();
    const inspeccionesTecnico = data
      .filter(i => i.tecnicoId === user.id)
      .map(i => {
        const vehiculo = storage.getVehiculoById(i.vehiculoId);
        const taller = vehiculo ? storage.getTallerById(vehiculo.tallerId) : null;
        const cilindros = storage.getAllCilindros(i.vehiculoId);
        const inspeccionesCilindrosData = storage.getAllInspeccionesCilindros(i.id);

        // Calcular progreso
        const cilindrosInspeccionados = inspeccionesCilindrosData.filter(ic =>
          ic.estado === EstadoInspeccion.COMPLETADA || ic.estado === EstadoInspeccion.APROBADA
        ).length;
        const progreso = cilindros.length > 0
          ? Math.round((cilindrosInspeccionados / cilindros.length) * 100)
          : 0;

        return {
          ...i,
          vehiculo,
          taller,
          cilindros,
          inspeccionesCilindrosData,
          progreso,
        };
      })
      .sort((a, b) => {
        // Primero las en proceso, luego por fecha de creación
        if (a.estado === EstadoInspeccion.EN_PROCESO && b.estado !== EstadoInspeccion.EN_PROCESO) {
          return -1;
        }
        if (b.estado === EstadoInspeccion.EN_PROCESO && a.estado !== EstadoInspeccion.EN_PROCESO) {
          return 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    setInspecciones(inspeccionesTecnico);
    setFilteredInspecciones(inspeccionesTecnico);
  };

  useEffect(() => {
    loadInspecciones();
  }, [user]);

  useEffect(() => {
    let filtered = inspecciones;

    // Filtrar por estado
    if (filterEstado !== 'ALL') {
      filtered = filtered.filter(i => i.estado === filterEstado);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(i =>
        i.vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.taller?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.vehiculo?.propietario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInspecciones(filtered);
  }, [searchTerm, filterEstado, inspecciones]);

  const totalInspecciones = inspecciones.length;
  const enProceso = inspecciones.filter(i => i.estado === EstadoInspeccion.EN_PROCESO).length;
  const completadas = inspecciones.filter(i => i.estado === EstadoInspeccion.COMPLETADA || i.estado === EstadoInspeccion.APROBADA).length;

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout sections={TECNICO_NAV} title="Mis Inspecciones">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
            <CheckCircle className="h-8 w-8 md:h-10 md:w-10" />
            Mis Inspecciones
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Historial completo de tus inspecciones realizadas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{totalInspecciones}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total Inspecciones</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-in-progress-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-in-progress-fg))]">{enProceso}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">En Proceso</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-completed-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-completed-fg))]">{completadas}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Completadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <Input
                  placeholder="Buscar por placa, taller o propietario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 md:h-14"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterEstado === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setFilterEstado('ALL')}
                  size="tablet"
                >
                  Todas
                </Button>
                <Button
                  variant={filterEstado === EstadoInspeccion.EN_PROCESO ? 'default' : 'outline'}
                  onClick={() => setFilterEstado(EstadoInspeccion.EN_PROCESO)}
                  size="tablet"
                >
                  En Proceso
                </Button>
                <Button
                  variant={filterEstado === EstadoInspeccion.COMPLETADA ? 'default' : 'outline'}
                  onClick={() => setFilterEstado(EstadoInspeccion.COMPLETADA)}
                  size="tablet"
                >
                  Completadas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Inspecciones */}
        <Card>
          <CardHeader>
            <CardTitle>Inspecciones</CardTitle>
            <CardDescription>
              {filteredInspecciones.length} inspección{filteredInspecciones.length !== 1 ? 'es' : ''} encontrada{filteredInspecciones.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInspecciones.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  {searchTerm || filterEstado !== 'ALL' ? 'No se encontraron inspecciones' : 'No tienes inspecciones aún'}
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
                            <Badge className={ESTADO_INSPECCION_COLORS[inspeccion.estado]}>
                              {ESTADO_INSPECCION_LABELS[inspeccion.estado]}
                            </Badge>
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
                              <span className="font-medium">Cilindros:</span>{' '}
                              {inspeccion.cilindros.length} ({inspeccion.inspeccionesCilindrosData.filter(ic => ic.estado === EstadoInspeccion.COMPLETADA || ic.estado === EstadoInspeccion.APROBADA).length} inspeccionados)
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Creada:</span>{' '}
                              {new Date(inspeccion.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          {/* Progreso */}
                          {inspeccion.estado === EstadoInspeccion.EN_PROCESO && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[hsl(var(--muted-foreground))]">Progreso</span>
                                <span className="font-semibold">{inspeccion.progreso}%</span>
                              </div>
                              <Progress value={inspeccion.progreso} className="h-2" />
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-2">
                          <Link href={`/tecnico/inspecciones/${inspeccion.solicitudId}`}>
                            <Button size="tablet" className="w-full gap-2">
                              {inspeccion.estado === EstadoInspeccion.EN_PROCESO ? (
                                <>
                                  <Clock className="h-4 w-4" />
                                  Continuar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  Ver Detalles
                                </>
                              )}
                            </Button>
                          </Link>
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
