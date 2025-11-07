'use client';

import { useState } from 'react';
import { Navbar } from './navbar';
import { Sidebar, type NavSection } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sections: NavSection[];
  title?: string;
}

export function DashboardLayout({ children, sections, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sections={sections}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
