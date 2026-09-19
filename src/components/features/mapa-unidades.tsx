"use client";

import { Mapa, type PontoMapa } from "@/components/ui/map";
import { tipoUnidadeLabel } from "@core/unidades";

export interface UnidadeParaMapa {
  id: string;
  nome: string;
  tipo: string;
  bairro: string | null;
  telefone: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Mapa das unidades — só as que têm coordenada cadastrada.
 *
 * Some por inteiro quando nenhuma unidade filtrada tem localização, em vez de
 * mostrar um mapa vazio de Canaã inteira: um mapa sem pino nenhum não ajuda a
 * decidir para onde ir, só ocupa espaço.
 */
export function MapaUnidades({ unidades }: { unidades: UnidadeParaMapa[] }) {
  const pontos: PontoMapa[] = unidades
    .filter((u): u is UnidadeParaMapa & { latitude: number; longitude: number } =>
      u.latitude != null && u.longitude != null,
    )
    .map((u) => ({
      id: u.id,
      lat: u.latitude,
      lng: u.longitude,
      titulo: u.nome,
      detalhe: [tipoUnidadeLabel(u.tipo), u.bairro, u.telefone].filter(Boolean).join(" · "),
    }));

  if (pontos.length === 0) return null;

  return (
    <div className="mb-6">
      <Mapa pontos={pontos} altura={280} className="w-full" />
    </div>
  );
}
