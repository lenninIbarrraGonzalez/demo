'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileCheck, Search, Eye, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import type { Informe, Vehiculo, Taller } from '@/types';

interface InformeWithDetails extends Informe {
  vehiculo: Vehiculo | null;
  taller: Taller | null;
}

export default function InformesPage() {
  const [informes, setInformes] = useState<InformeWithDetails[]>([]);
  const [filteredInformes, setFilteredInformes] = useState<InformeWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInformes = () => {
    const data = storage.getAllInformes();
    const informesWithDetails = data
      .map(i => {
        const vehiculo = storage.getVehiculoById(i.vehiculoId);
        const taller = storage.getTallerById(i.tallerId);
        return {
          ...i,
          vehiculo,
          taller,
        };
      })
      .sort((a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime());

    setInformes(informesWithDetails);
    setFilteredInformes(informesWithDetails);
  };

  useEffect(() => {
    loadInformes();
  }, []);

  useEffect(() => {
    let filtered = informes;

    if (searchTerm.trim()) {
      filtered = filtered.filter(i =>
        i.vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.taller?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.vehiculo?.propietario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInformes(filtered);
  }, [searchTerm, informes]);

  const totalInformes = informes.length;
  const esteMes = informes.filter(i => {
    const fecha = new Date(i.fechaGeneracion);
    const ahora = new Date();
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
  }).length;

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Informes">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
            <FileCheck className="h-8 w-8 md:h-10 md:w-10" />
            Informes Generados
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
            Todos los informes de inspección generados
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{totalInformes}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total Informes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[hsl(var(--status-assigned-border))]">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[hsl(var(--status-assigned-fg))]">{esteMes}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Este Mes</p>
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
                placeholder="Buscar por placa, taller o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 md:h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Informes */}
        <Card>
          <CardHeader>
            <CardTitle>Informes</CardTitle>
            <CardDescription>
              {filteredInformes.length} informe{filteredInformes.length !== 1 ? 's' : ''} encontrado{filteredInformes.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInformes.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">
                  {searchTerm ? 'No se encontraron informes' : 'No hay informes generados'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInformes.map((informe) => (
                  <Card key={informe.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Información */}
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-semibold">
                            {informe.vehiculo?.placa || 'Vehículo desconocido'}
                          </h3>

                          <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                            {informe.vehiculo && (
                              <p>
                                <span className="font-medium">Vehículo:</span>{' '}
                                {informe.vehiculo.marca} {informe.vehiculo.modelo} ({informe.vehiculo.año})
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Taller:</span>{' '}
                              {informe.taller?.nombre || 'Desconocido'}
                            </p>
                            <p>
                              <span className="font-medium">Propietario:</span>{' '}
                              {informe.vehiculo?.propietario || 'Desconocido'}
                            </p>
                            <p>
                              <span className="font-medium">Generado:</span>{' '}
                              {new Date(informe.fechaGeneracion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Link href={`/super-admin/informes/${informe.id}`}>
                            <Button size="tablet" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Ver
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
