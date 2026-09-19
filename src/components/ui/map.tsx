"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { Icon } from "@/components/ui/icon";

/**
 * Mapa — Mapbox GL, com um propósito só: mostrar UNIDADES DE SAÚDE.
 *
 * Não é um componente genérico de "qualquer local do app". A rede de apoio
 * contra violência (delegacia, CREAS, casa-abrigo) NUNCA passa por aqui — um
 * pino exato numa tela de proteção é o tipo de dado que pode ser usado contra
 * quem o app existe para proteger, e casa-abrigo tem endereço propositalmente
 * não-divulgado. Aquela tela continua em texto: endereço, telefone, horário.
 * Ver `packages/core/protecao.ts` e a ausência de `latitude`/`longitude` no
 * modelo `SupportService` do schema — a ausência é a decisão, não uma
 * pendência.
 *
 * Unidade de saúde (UBS, hospital, policlínica) é o oposto: conteúdo público
 * do município, sem dono, e quanto mais fácil de achar no mapa, melhor.
 */

/** Centro de Canaã dos Carajás — enquadramento inicial quando não há pontos. */
const CENTRO_CANAA: [number, number] = [-49.8797, -6.4988];

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface PontoMapa {
  id: string;
  lat: number;
  lng: number;
  titulo: string;
  detalhe?: string;
  /** Marcador em destaque (ex.: a unidade filtrada corresponde à busca). */
  ativo?: boolean;
}

interface MapaProps {
  pontos: PontoMapa[];
  className?: string;
  /** Altura do mapa em pixels. */
  altura?: number;
  /**
   * Modo de escolher local: um clique no mapa reposiciona o único marcador e
   * devolve as coordenadas. Usado no formulário administrativo — nunca na
   * tela pública.
   */
  selecionavel?: boolean;
  valorSelecionado?: { lat: number; lng: number } | null;
  onSelecionar?: (ponto: { lat: number; lng: number }) => void;
  onClicarPonto?: (id: string) => void;
}

/**
 * Aviso quando o token não está configurado.
 *
 * Um mapa Mapbox sem `accessToken` não renderiza tile nenhum — fica um
 * quadriculado cinza com um erro 401 discreto no canto, que parece o site
 * quebrado. Melhor dizer exatamente o que falta.
 */
function AvisoSemToken({ altura }: { altura: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line bg-mist px-6 text-center"
      style={{ height: altura }}
    >
      <Icon name="pin" className="h-6 w-6 text-muted" />
      <p className="text-sm font-medium text-ink">Mapa ainda não configurado</p>
      <p className="max-w-xs text-xs text-muted">
        Defina <code className="rounded bg-white px-1 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> no
        .env para exibir o mapa das unidades.
      </p>
    </div>
  );
}

export function Mapa({
  pontos,
  className,
  altura = 320,
  selecionavel = false,
  valorSelecionado = null,
  onSelecionar,
  onClicarPonto,
}: MapaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marcadoresRef = useRef<mapboxgl.Marker[]>([]);
  const marcadorSelecaoRef = useRef<mapboxgl.Marker | null>(null);
  const [carregado, setCarregado] = useState(false);

  // Cria o mapa uma vez. Recriar a cada render por causa de `pontos` mudando
  // faria a câmera pular de volta ao centro toda hora — os marcadores são
  // atualizados num efeito separado, o mapa em si nasce só aqui.
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const inicial = pontos[0]
      ? ([pontos[0].lng, pontos[0].lat] as [number, number])
      : CENTRO_CANAA;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      // Estilo claro, sem os POIs e rótulos comerciais do padrão "streets" —
      // a tela é sobre as unidades, não sobre toda loja do bairro.
      style: "mapbox://styles/mapbox/light-v11",
      center: inicial,
      zoom: pontos.length ? 13 : 12,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => setCarregado(true));

    if (selecionavel && onSelecionar) {
      map.on("click", (e) => {
        onSelecionar({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na montagem
  }, []);

  // Marcadores das unidades já existentes. Aparecem também no modo seleção —
  // dão contexto de onde já existe unidade cadastrada perto de onde se está
  // adicionando uma nova — só não recebem popup/clique lá, para não competir
  // com o marcador de seleção.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    marcadoresRef.current.forEach((m) => m.remove());
    marcadoresRef.current = [];

    for (const p of pontos) {
      const el = document.createElement("div");
      el.className = "map-pin";
      el.style.cssText = pinStyle(p.ativo);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([p.lng, p.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 18, closeButton: false }).setHTML(
            `<strong style="font-family:var(--font-display,sans-serif)">${escapeHtml(p.titulo)}</strong>` +
              (p.detalhe ? `<div style="margin-top:2px;color:#726b67">${escapeHtml(p.detalhe)}</div>` : ""),
          ),
        )
        .addTo(map);

      if (onClicarPonto) {
        el.addEventListener("click", () => onClicarPonto(p.id));
      }

      marcadoresRef.current.push(marker);
    }

    // No modo seleção, a câmera é do marcador que está sendo posicionado —
    // reenquadrar pelas unidades já existentes puxaria a vista para longe do
    // clique que a pessoa acabou de dar.
    if (selecionavel) return;

    if (pontos.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      pontos.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 0 });
    } else if (pontos.length === 1) {
      map.flyTo({ center: [pontos[0].lng, pontos[0].lat], zoom: 14, duration: 400 });
    }
  }, [pontos, selecionavel, carregado, onClicarPonto]);

  // Marcador único e arrastável (modo seleção do formulário administrativo).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selecionavel) return;

    if (!valorSelecionado) {
      marcadorSelecaoRef.current?.remove();
      marcadorSelecaoRef.current = null;
      return;
    }

    const posicao: [number, number] = [valorSelecionado.lng, valorSelecionado.lat];

    if (marcadorSelecaoRef.current) {
      marcadorSelecaoRef.current.setLngLat(posicao);
    } else {
      const el = document.createElement("div");
      el.style.cssText = pinStyle(true);
      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom", draggable: true })
        .setLngLat(posicao)
        .addTo(map);
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();
        onSelecionar?.({ lat, lng });
      });
      marcadorSelecaoRef.current = marker;
    }
  }, [valorSelecionado, selecionavel, carregado, onSelecionar]);

  if (!TOKEN) return <AvisoSemToken altura={altura} />;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: altura, borderRadius: "1rem", overflow: "hidden" }}
      role="img"
      aria-label={
        selecionavel
          ? "Mapa para marcar a localização da unidade"
          : `Mapa com ${pontos.length} unidade${pontos.length === 1 ? "" : "s"} de saúde`
      }
    />
  );
}

function pinStyle(destaque?: boolean): string {
  const cor = destaque ? "#d1354a" : "#ffffff";
  const borda = destaque ? "#ffffff" : "#d1354a";
  return [
    "width:16px",
    "height:16px",
    "border-radius:9999px",
    `background:${cor}`,
    `border:3px solid ${borda}`,
    "box-shadow:0 2px 8px rgba(58,30,37,0.35)",
    "cursor:pointer",
  ].join(";");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
