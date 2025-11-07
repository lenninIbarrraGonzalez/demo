'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Car, Search, Wrench } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TALLER_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { useAuth } from '@/lib/contexts/auth-context';
import type { Vehiculo, Cilindro } from '@/types';

interface VehiculoWithCilindros extends Vehiculo {
  cilindros: Cilindro[];
}

export default function VehiculosPage() {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState<VehiculoWithCilindros[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehiculos, setFilteredVehiculos] = useState<VehiculoWithCilindros[]>([]);

  const loadVehiculos = () => {
    if (!user?.tallerId) return;

    const data = storage.getAllVehiculos(user.tallerId);
    const vehiculosWithCilindros = data.map(v => ({
      ...v,
      cilindros: storage.getAllCilindros(v.id)
    }));
    setVehiculos(vehiculosWithCilindros);
    setFilteredVehiculos(vehiculosWithCilindros);
  };

  useEffect(() => {
    loadVehiculos();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVehiculos(vehiculos);
    } else {
      const filtered = vehiculos.filter(
        (v) =>
          v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehiculos(filtered);
    }
  }, [searchTerm, vehiculos]);

  if (!user?.tallerId) {
    return (
      <DashboardLayout sections={TALLER_NAV} title="Vehículos">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[hsl(var(--muted-foreground))]">
            Error: Usuario no asociado a un taller
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={TALLER_NAV} title="Vehículos">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Car className="h-8 w-8 md:h-10 md:w-10" />
              Vehículos
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Gestiona los vehículos de tu taller
            </p>
          </div>
          <Link href="/taller/vehiculos/nuevo">
            <Button size="tablet" className="w-full md:w-auto gap-2">
              <Plus className="h-5 w-5" />
              Registrar Vehículo
            </Button>
          </Link>
        </div>

        {/* Buscador */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <Input
                placeholder="Buscar por placa, propietario, marca o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 md:h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vehículos */}
        <div>
          {filteredVehiculos.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Car className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                  <p className="text-[hsl(var(--muted-foreground))] text-sm md:text-base">
                    {searchTerm ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
                  </p>
                  {!searchTerm && (
                    <Link href="/taller/vehiculos/nuevo">
                      <Button className="mt-4" size="tablet">
                        Registrar Primer Vehículo
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredVehiculos.map((vehiculo) => (
                <Card key={vehiculo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{vehiculo.placa}</CardTitle>
                        <CardDescription>
                          {vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {vehiculo.cilindros.length} cilindros
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[hsl(var(--muted-foreground))]">Propietario:</span>
                        <p className="font-medium">{vehiculo.propietario}</p>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--muted-foreground))]">Documento:</span>
                        <p className="font-medium">{vehiculo.documentoPropietario}</p>
                      </div>
                      {vehiculo.telefonoPropietario && (
                        <div>
                          <span className="text-[hsl(var(--muted-foreground))]">Teléfono:</span>
                          <p className="font-medium">{vehiculo.telefonoPropietario}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/taller/vehiculos/${vehiculo.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="tablet">
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/taller/vehiculos/${vehiculo.id}/cilindros`}>
                        <Button variant="outline" size="icon" className="h-12 w-12">
                          <Wrench className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
