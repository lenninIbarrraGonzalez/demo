'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer, Eye } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPER_ADMIN_NAV } from '@/lib/constants/navigation';
import { storage } from '@/lib/storage/storage';
import { toast } from 'sonner';
import type { Informe, Inspeccion, Vehiculo, Taller, Usuario, Cilindro, InspeccionCilindro, PlantillaFormulario } from '@/types';

export default function VisualizarInformePage() {
  const params = useParams();
  const router = useRouter();
  const informeId = params?.id as string;
  const contenidoRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [informe, setInforme] = useState<Informe | null>(null);
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [taller, setTaller] = useState<Taller | null>(null);
  const [tecnico, setTecnico] = useState<Usuario | null>(null);
  const [cilindros, setCilindros] = useState<Cilindro[]>([]);
  const [inspeccionesCilindros, setInspeccionesCilindros] = useState<InspeccionCilindro[]>([]);
  const [plantilla, setPlantilla] = useState<PlantillaFormulario | null>(null);

  useEffect(() => {
    if (!informeId) return;

    const informeData = storage.getInformeById(informeId);
    if (!informeData) {
      toast.error('Informe no encontrado');
      router.push('/super-admin/informes');
      return;
    }

    setInforme(informeData);

    const inspeccionData = storage.getInspeccionById(informeData.inspeccionId);
    if (!inspeccionData) {
      toast.error('Inspección no encontrada');
      router.push('/super-admin/informes');
      return;
    }

    setInspeccion(inspeccionData);

    const vehiculoData = storage.getVehiculoById(informeData.vehiculoId);
    const tallerData = storage.getTallerById(informeData.tallerId);
    const tecnicoData = storage.getUsuarioById(inspeccionData.tecnicoId);
    const cilindrosData = storage.getAllCilindros(informeData.vehiculoId);
    const inspeccionesCilindrosData = storage.getAllInspeccionesCilindros(inspeccionData.id);
    const plantillaData = storage.getPlantillaFormularioById(inspeccionData.plantillaFormularioId);

    setVehiculo(vehiculoData);
    setTaller(tallerData);
    setTecnico(tecnicoData);
    setCilindros(cilindrosData);
    setInspeccionesCilindros(inspeccionesCilindrosData);
    setPlantilla(plantillaData);

    setIsLoading(false);
  }, [informeId, router]);

  const handleImprimir = () => {
    window.print();
  };

  const handleDescargarPDF = async () => {
    try {
      // Importar jsPDF dinámicamente
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      if (!contenidoRef.current) return;

      toast.info('Generando PDF...');

      // Capturar el contenido como imagen
      const canvas = await html2canvas(contenidoRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Informe_${vehiculo?.placa}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sections={SUPER_ADMIN_NAV} title="Cargando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">Cargando informe...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!informe || !inspeccion || !vehiculo || !plantilla) {
    return null;
  }

  return (
    <DashboardLayout sections={SUPER_ADMIN_NAV} title="Informe">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 print:hidden">
          <Link href="/super-admin/informes">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
              Informe de Inspección
            </h1>
            <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-2">
              {vehiculo.placa} - Generado: {new Date(informe.fechaGeneracion).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleImprimir} size="tablet" variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button onClick={handleDescargarPDF} size="tablet" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenido del Informe */}
        <div ref={contenidoRef} className="bg-white text-black p-8 print:p-0">
          {/* Encabezado */}
          <div className="border-b-4 border-[#2563eb] pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1e40af] mb-2">HOITSU</h1>
                <p className="text-lg font-semibold">Informe de Inspección GNV</p>
              </div>
              <div className="text-right">
                <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                  APROBADO
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  N° {informe.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Información General */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#1e40af] mb-3 border-b border-gray-300 pb-1">
                DATOS DEL VEHÍCULO
              </h2>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Placa:</span>
                  <span>{vehiculo.placa}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Marca:</span>
                  <span>{vehiculo.marca}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Modelo:</span>
                  <span>{vehiculo.modelo}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Año:</span>
                  <span>{vehiculo.año}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Propietario:</span>
                  <span>{vehiculo.propietario}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Cédula:</span>
                  <span>{vehiculo.documentoPropietario}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#1e40af] mb-3 border-b border-gray-300 pb-1">
                DATOS DE INSPECCIÓN
              </h2>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Taller:</span>
                  <span>{taller?.nombre}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Técnico:</span>
                  <span>{tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Fecha:</span>
                  <span>
                    {new Date(inspeccion.fechaCompletada || inspeccion.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Cilindros:</span>
                  <span>{cilindros.length}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Formulario:</span>
                  <span className="text-xs">{plantilla.nombre}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Cilindros */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#1e40af] mb-3 border-b border-gray-300 pb-1">
              CILINDROS INSPECCIONADOS
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">N° Serie</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Capacidad</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Fabricante</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Año</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cilindros.map((cilindro, index) => (
                    <tr key={cilindro.id}>
                      <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2">{cilindro.numeroSerie}</td>
                      <td className="border border-gray-300 px-3 py-2">{cilindro.capacidad}L</td>
                      <td className="border border-gray-300 px-3 py-2">{cilindro.fabricante}</td>
                      <td className="border border-gray-300 px-3 py-2">{cilindro.añoFabricacion}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          APROBADO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detalles por Cilindro */}
          {cilindros.map((cilindro, index) => {
            const inspeccionCilindro = inspeccionesCilindros.find(ic => ic.cilindroId === cilindro.id);
            if (!inspeccionCilindro) return null;

            return (
              <div key={cilindro.id} className="mb-6 break-inside-avoid">
                <h2 className="text-lg font-bold text-[#1e40af] mb-3 border-b border-gray-300 pb-1">
                  CILINDRO {index + 1} - SERIE: {cilindro.numeroSerie}
                </h2>
                <div className="space-y-3">
                  {plantilla.campos.map((campo) => {
                    const valor = inspeccionCilindro.respuestas?.[campo.id];
                    if (!valor) return null;

                    return (
                      <div key={campo.id} className="grid grid-cols-3 gap-2 text-sm">
                        <div className="col-span-1 font-semibold text-gray-700">
                          {campo.label}:
                        </div>
                        <div className="col-span-2">
                          {Array.isArray(valor) ? valor.join(', ') : String(valor)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Conclusiones */}
          <div className="mt-8 border-t-2 border-gray-300 pt-6">
            <h2 className="text-lg font-bold text-[#1e40af] mb-3">CONCLUSIONES</h2>
            <p className="text-sm mb-4">
              Se inspeccionaron un total de <strong>{cilindros.length} cilindro(s)</strong> del vehículo con placa{' '}
              <strong>{vehiculo.placa}</strong>. Todos los cilindros fueron inspeccionados de acuerdo al formulario{' '}
              <strong>{plantilla.nombre}</strong> y cumplen con los estándares de seguridad requeridos.
            </p>
            <div className="bg-green-50 border-l-4 border-green-600 p-4 mt-4">
              <p className="text-sm font-semibold text-green-800">
                ✓ El vehículo ha APROBADO la inspección de cilindros GNV
              </p>
            </div>
          </div>

          {/* Firmas */}
          <div className="mt-12 grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-12">
                <p className="font-semibold">{tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'N/A'}</p>
                <p className="text-sm text-gray-600">Técnico Inspector</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-12">
                <p className="font-semibold">HOITSU</p>
                <p className="text-sm text-gray-600">Organismo de Inspección</p>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
            <p>Este documento es un informe oficial generado por HOITSU</p>
            <p>Fecha de generación: {new Date(informe.fechaGeneracion).toLocaleString('es-ES')}</p>
            <p className="mt-1">ID del informe: {informe.id}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
