'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TipoCampo, OperadorCondicional } from '@/types';
import type { CampoFormulario, PlantillaFormulario } from '@/types';

interface FormRendererProps {
  plantilla: PlantillaFormulario;
  respuestas?: Record<string, any>;
  onRespuestasChange?: (respuestas: Record<string, any>) => void;
  readonly?: boolean;
}

export function FormRenderer({
  plantilla,
  respuestas: respuestasIniciales = {},
  onRespuestasChange,
  readonly = false,
}: FormRendererProps) {
  const [respuestas, setRespuestas] = useState<Record<string, any>>(respuestasIniciales);

  useEffect(() => {
    setRespuestas(respuestasIniciales);
  }, [respuestasIniciales]);

  const actualizarRespuesta = (campoId: string, valor: any) => {
    const nuevasRespuestas = { ...respuestas, [campoId]: valor };
    setRespuestas(nuevasRespuestas);
    if (onRespuestasChange) {
      onRespuestasChange(nuevasRespuestas);
    }
  };

  // Evaluar si un campo debe mostrarse según su lógica condicional
  const deberMostrarCampo = (campo: CampoFormulario): boolean => {
    if (!campo.logicaCondicional || !campo.logicaCondicional.mostrarSi) {
      return true;
    }

    const { mostrarSi, operadorLogico = 'AND' } = campo.logicaCondicional;

    const resultados = mostrarSi.map(condicion => {
      const valorRespuesta = respuestas[condicion.campoId];
      const valorEsperado = condicion.valor;

      switch (condicion.operador) {
        case OperadorCondicional.EQUALS:
          return valorRespuesta === valorEsperado;

        case OperadorCondicional.NOT_EQUALS:
          return valorRespuesta !== valorEsperado;

        case OperadorCondicional.CONTAINS:
          if (typeof valorRespuesta === 'string') {
            return valorRespuesta.includes(valorEsperado);
          }
          if (Array.isArray(valorRespuesta)) {
            return valorRespuesta.includes(valorEsperado);
          }
          return false;

        case OperadorCondicional.GREATER_THAN:
          return Number(valorRespuesta) > Number(valorEsperado);

        case OperadorCondicional.LESS_THAN:
          return Number(valorRespuesta) < Number(valorEsperado);

        case OperadorCondicional.IS_EMPTY:
          return !valorRespuesta || valorRespuesta === '' || (Array.isArray(valorRespuesta) && valorRespuesta.length === 0);

        case OperadorCondicional.IS_NOT_EMPTY:
          return !!valorRespuesta && valorRespuesta !== '' && (!Array.isArray(valorRespuesta) || valorRespuesta.length > 0);

        default:
          return true;
      }
    });

    // Aplicar operador lógico
    if (operadorLogico === 'AND') {
      return resultados.every(r => r);
    } else {
      return resultados.some(r => r);
    }
  };

  // Ordenar campos por orden
  const camposOrdenados = [...plantilla.campos].sort((a, b) => a.orden - b.orden);

  // Filtrar campos visibles
  const camposVisibles = camposOrdenados.filter(deberMostrarCampo);

  return (
    <div className="space-y-6">
      {camposVisibles.map((campo) => (
        <Card key={campo.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <RenderCampo
              campo={campo}
              valor={respuestas[campo.id]}
              onChange={(valor) => actualizarRespuesta(campo.id, valor)}
              readonly={readonly}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente para renderizar un campo individual
function RenderCampo({
  campo,
  valor,
  onChange,
  readonly,
}: {
  campo: CampoFormulario;
  valor: any;
  onChange: (valor: any) => void;
  readonly: boolean;
}) {
  const placeholder = campo.placeholder || '';

  return (
    <div className="space-y-3">
      <Label htmlFor={campo.id} className="text-base font-medium">
        {campo.label}
        {campo.required && <span className="text-red-600 ml-1">*</span>}
      </Label>

      {/* TEXT */}
      {campo.tipo === TipoCampo.TEXT && (
        <Input
          id={campo.id}
          value={valor || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={campo.required}
          disabled={readonly}
          className="h-12 md:h-14"
        />
      )}

      {/* TEXTAREA */}
      {campo.tipo === TipoCampo.TEXTAREA && (
        <Textarea
          id={campo.id}
          value={valor || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={campo.required}
          disabled={readonly}
          rows={4}
          className="resize-none"
        />
      )}

      {/* NUMBER */}
      {campo.tipo === TipoCampo.NUMBER && (
        <Input
          id={campo.id}
          type="number"
          value={valor || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={campo.required}
          disabled={readonly}
          className="h-12 md:h-14"
        />
      )}

      {/* SELECT */}
      {campo.tipo === TipoCampo.SELECT && (
        <Select
          value={valor || ''}
          onValueChange={onChange}
          disabled={readonly}
        >
          <SelectTrigger className="h-12 md:h-14">
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            {campo.opciones?.map((opcion, index) => (
              <SelectItem key={index} value={opcion}>
                {opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* RADIO */}
      {campo.tipo === TipoCampo.RADIO && (
        <RadioGroup
          value={valor || ''}
          onValueChange={onChange}
          disabled={readonly}
        >
          <div className="space-y-3">
            {campo.opciones?.map((opcion, index) => (
              <div key={index} className="flex items-center space-x-3">
                <RadioGroupItem value={opcion} id={`${campo.id}_${index}`} className="h-5 w-5" />
                <Label htmlFor={`${campo.id}_${index}`} className="font-normal cursor-pointer">
                  {opcion}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {/* CHECKBOX */}
      {campo.tipo === TipoCampo.CHECKBOX && (
        <div className="space-y-3">
          {campo.opciones?.map((opcion, index) => {
            const valorActual = Array.isArray(valor) ? valor : [];
            const isChecked = valorActual.includes(opcion);

            return (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox
                  id={`${campo.id}_${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...valorActual, opcion]);
                    } else {
                      onChange(valorActual.filter((v: string) => v !== opcion));
                    }
                  }}
                  disabled={readonly}
                  className="h-5 w-5"
                />
                <Label htmlFor={`${campo.id}_${index}`} className="font-normal cursor-pointer">
                  {opcion}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {/* DATE */}
      {campo.tipo === TipoCampo.DATE && (
        <Input
          id={campo.id}
          type="date"
          value={valor || ''}
          onChange={(e) => onChange(e.target.value)}
          required={campo.required}
          disabled={readonly}
          className="h-12 md:h-14"
        />
      )}

      {/* FILE */}
      {campo.tipo === TipoCampo.FILE && (
        <div className="space-y-2">
          <Input
            id={campo.id}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  onChange({
                    nombre: file.name,
                    tipo: file.type,
                    tamano: file.size,
                    data: reader.result,
                  });
                };
                reader.readAsDataURL(file);
              }
            }}
            required={campo.required}
            disabled={readonly}
            className="h-12 md:h-14"
            accept="image/*"
          />
          {valor && valor.nombre && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Archivo: {valor.nombre} ({(valor.tamano / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
      )}

      {/* Ayuda/Validación */}
      {campo.validacion?.mensaje && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {campo.validacion.mensaje}
        </p>
      )}
    </div>
  );
}
