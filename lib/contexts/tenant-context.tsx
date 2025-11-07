'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage/storage';
import type { TenantContextType, Taller } from '@/types';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Taller | null>(null);

  useEffect(() => {
    // Cargar tenant desde localStorage
    const storedTenantId = localStorage.getItem('currentTenantId');
    if (storedTenantId) {
      setTenant(storedTenantId);
    }
  }, []);

  const setTenant = (tenantId: string | null) => {
    setCurrentTenantId(tenantId);

    if (tenantId) {
      const taller = storage.getTallerById(tenantId);
      setCurrentTenant(taller);
      localStorage.setItem('currentTenantId', tenantId);
    } else {
      setCurrentTenant(null);
      localStorage.removeItem('currentTenantId');
    }
  };

  const value: TenantContextType = {
    currentTenantId,
    currentTenant,
    setTenant
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
