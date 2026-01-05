'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Pencil, Mail, Phone } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import { Role } from '@/types';
import type { Usuario } from '@/types';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsuarios = () => {
    // Solo cargamos técnicos (Role.TECNICO) y usuarios HOITSU
    const data = storage.getAllUsuarios(Role.TECNICO);
    setUsuarios(data);
    setFilteredUsuarios(data);
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    let filtered = usuarios;

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.telefono && u.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsuarios(filtered);
  }, [searchTerm, usuarios]);

  const handleToggleActivo = async (id: string, currentState: boolean) => {
    const updated = storage.updateUsuario(id, { activo: !currentState });
    if (updated) {
      toast.success(
        !currentState ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente'
      );
      loadUsuarios();
    } else {
      toast.error('Error al actualizar el usuario');
    }
  };

  const activosCount = usuarios.filter(u => u.activo).length;
  const inactivosCount = usuarios.filter(u => !u.activo).length;

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Usuarios HOITSU">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
              <Users className="h-8 w-8 md:h-10 md:w-10" />
              Usuarios HOITSU
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              Gestiona los técnicos de inspección
            </p>
          </div>
          <Link href="/super-admin/usuarios/nuevo">
            <Button size="tablet" className="w-full md:w-auto gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{usuarios.length}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Total Usuarios</p>
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
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 md:h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Técnicos</CardTitle>
            <CardDescription>
              {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''} encontrado{filteredUsuarios.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsuarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] mb-4">
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </p>
                {!searchTerm && (
                  <Link href="/super-admin/usuarios/nuevo">
                    <Button size="tablet">
                      <Plus className="h-5 w-5 mr-2" />
                      Crear Primer Usuario
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsuarios.map((usuario) => (
                  <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Información del Usuario */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">
                              {usuario.nombre} {usuario.apellido}
                            </h3>
                            <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {usuario.role === Role.TECNICO ? 'Técnico' : usuario.role}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0" />
                              <span className="break-all">{usuario.email}</span>
                            </div>
                            {usuario.telefono && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>{usuario.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-3 md:items-end">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <Switch
                              checked={usuario.activo}
                              onCheckedChange={() => handleToggleActivo(usuario.id, usuario.activo)}
                            />
                          </div>
                          <Link href={`/super-admin/usuarios/${usuario.id}`}>
                            <Button variant="outline" size="tablet" className="w-full md:w-auto gap-2">
                              <Pencil className="h-4 w-4" />
                              Editar
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
