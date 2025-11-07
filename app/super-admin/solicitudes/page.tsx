'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, UserPlus, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { ESTADO_SOLICITUD_COLORS, ESTADO_SOLICITUD_LABELS } from '@/lib/constants/status';
import { EstadoSolicitud, Role } from '@/types';
import type { Solicitud, Vehiculo, Taller, Usuario } from '@/types';

interface SolicitudWithDetails extends Solicitud {
  vehiculo: Vehiculo | null;
  taller: Taller | null;
  tecnico: Usuario | null;
  numeroCilindros: number;
}

export default function SuperAdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudWithDetails[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  const loadSolicitudes = () => {
    const data = storage.getAllSolicitudes();
    const solicitudesWithDetails = data
      .map(s => {
        const vehiculo = storage.getVehiculoById(s.vehiculoId);
        const taller = storage.getTallerById(s.tallerId);
        const tecnico = s.tecnicoAsignadoId ? storage.getUsuarioById(s.tecnicoAsignadoId) : null;
        const cilindros = storage.getAllCilindros(s.vehiculoId);
        return {
          ...s,
          vehiculo,
          taller,
          tecnico,
          numeroCilindros: cilindros.length,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setSolicitudes(solicitudesWithDetails);
    setFilteredSolicitudes(solicitudesWithDetails);
  };

  useEffect(() => {
    loadSolicitudes();
  }, []);

  useEffect(() => {
    let filtered = solicitudes;

    // Filtrar por estado
    if (filterEstado !== 'all') {
      filtered = filtered.filter(s => s.estado === filterEstado);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(s =>
        s.vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.taller?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.vehiculo?.propietario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSolicitudes(filtered);
  }, [filterEstado, searchTerm, solicitudes]);

  const pendientesCount = solicitudes.filter(s => s.estado === EstadoSolicitud.PENDIENTE).length;
  const asignadasCount = solicitudes.filter(s => s.estado === EstadoSolicitud.ASIGNADA).length;

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Solicitudes">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
            <ClipboardList className="h-8 w-8 md:h-10 md:w-10" />
            Gestión de Solicitudes
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Asigna técnicos a las solicitudes de inspección
          </p>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterEstado('all')}>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{solicitudes.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[hsl(var(--status-pending-border))]" onClick={() => setFilterEstado(EstadoSolicitud.PENDIENTE)}>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-pending-fg))]">{pendientesCount}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[hsl(var(--status-assigned-border))]" onClick={() => setFilterEstado(EstadoSolicitud.ASIGNADA)}>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-assigned-fg))]">{asignadasCount}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Asignadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <Input
                  placeholder="Buscar por placa, taller o propietario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 md:h-14"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterEstado === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterEstado('all')}
                  size="tablet"
                >
                  Todas
                </Button>
                <Button
                  variant={filterEstado === EstadoSolicitud.PENDIENTE ? 'default' : 'outline'}
                  onClick={() => setFilterEstado(EstadoSolicitud.PENDIENTE)}
                  size="tablet"
                >
                  Pendientes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes</CardTitle>
            <CardDescription>
              {filteredSolicitudes.length} solicitud{filteredSolicitudes.length !== 1 ? 'es' : ''} encontrada{filteredSolicitudes.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSolicitudes.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes registradas'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSolicitudes.map((solicitud) => (
                  <Card key={solicitud.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                              {solicitud.vehiculo?.placa || 'Vehículo desconocido'}
                            </h3>
                            <Badge className={ESTADO_SOLICITUD_COLORS[solicitud.estado as EstadoSolicitud]}>
                              {ESTADO_SOLICITUD_LABELS[solicitud.estado as EstadoSolicitud]}
                            </Badge>
                            <Badge variant="outline">
                              {solicitud.numeroCilindros} cilindro{solicitud.numeroCilindros !== 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                            <p>
                              <span className="font-medium">Taller:</span> {solicitud.taller?.nombre || 'Desconocido'}
                            </p>
                            {solicitud.vehiculo && (
                              <p>
                                <span className="font-medium">Vehículo:</span>{' '}
                                {solicitud.vehiculo.marca} {solicitud.vehiculo.modelo} ({solicitud.vehiculo.año})
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Solicitada:</span>{' '}
                              {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            {solicitud.tecnico && (
                              <p>
                                <span className="font-medium">Técnico:</span>{' '}
                                {solicitud.tecnico.nombre} {solicitud.tecnico.apellido}
                              </p>
                            )}
                          </div>

                          {solicitud.observaciones && (
                            <div className="mt-2 p-3 bg-[hsl(var(--muted))] rounded-md">
                              <p className="text-xs md:text-sm">
                                <span className="font-medium">Observaciones:</span> {solicitud.observaciones}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {solicitud.estado === EstadoSolicitud.PENDIENTE && (
                            <Link href={`/super-admin/solicitudes/${solicitud.id}/asignar`}>
                              <Button size="tablet" className="w-full gap-2">
                                <UserPlus className="h-4 w-4" />
                                Asignar Técnico
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
