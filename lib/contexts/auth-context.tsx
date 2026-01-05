'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage/storage';
import { seedDatabase } from '@/lib/storage/seed';
import { setCookie, getCookie, deleteCookie } from '@/lib/utils/cookies';
import type { AuthContextType, AuthUser } from '@/types';
import { Role } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Migra los emails de @oinstec.com a @hoitsu.com
 */
function migrateEmails() {
  if (typeof window === 'undefined') return;

  const dbKey = 'tanquesGas_db';
  const data = localStorage.getItem(dbKey);
  if (!data) return;

  try {
    const db = JSON.parse(data);
    let needsUpdate = false;

    // Migrar usuarios
    if (db.usuarios) {
      Object.keys(db.usuarios).forEach((key) => {
        const usuario = db.usuarios[key];
        if (usuario.email && usuario.email.includes('@oinstec.com')) {
          usuario.email = usuario.email.replace('@oinstec.com', '@hoitsu.com');
          needsUpdate = true;
        }
        if (usuario.apellido === 'OINSTEC') {
          usuario.apellido = 'HOITSU';
          needsUpdate = true;
        }
      });
    }

    if (needsUpdate) {
      localStorage.setItem(dbKey, JSON.stringify(db));
      console.log('Emails migrados de @oinstec.com a @hoitsu.com');
    }
  } catch (error) {
    console.error('Error migrando emails:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar storage
    storage.initialize();

    // Migrar emails de @oinstec.com a @hoitsu.com si existen
    migrateEmails();

    // Seed database si no hay datos
    const talleres = storage.getAllTalleres();
    if (talleres.length === 0) {
      seedDatabase();
    }

    // Cargar usuario desde localStorage o cookie
    let storedUser = null;
    if (typeof window !== 'undefined') {
      storedUser = localStorage.getItem('currentUser');
    }

    // Si no hay en localStorage, intentar desde cookie
    if (!storedUser) {
      storedUser = getCookie('currentUser');
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Sincronizar localStorage con cookie si es necesario
        if (typeof window !== 'undefined' && !localStorage.getItem('currentUser')) {
          localStorage.setItem('currentUser', storedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUser');
        }
        deleteCookie('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const usuario = storage.getUsuarioByEmail(email);

      if (!usuario) {
        return false;
      }

      // En producción, comparar hashes
      if (usuario.password !== password) {
        return false;
      }

      if (!usuario.activo) {
        return false;
      }

      const authUser: AuthUser = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        role: usuario.role,
        tallerId: usuario.tallerId,
        avatar: usuario.avatar
      };

      setUser(authUser);

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(authUser));
      }

      // Guardar en cookie para el middleware
      setCookie('currentUser', JSON.stringify(authUser), 7);

      // Si es admin de taller, guardar el tenantId
      if (usuario.role === Role.ADMIN_TALLER && usuario.tallerId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentTenantId', usuario.tallerId);
        }
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);

    // Eliminar de localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentTenantId');
    }

    // Eliminar cookie
    deleteCookie('currentUser');
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
