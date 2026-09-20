"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { Icon } from "@/components/ui/icon";

const TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface PontoCobertura {
  id: string;
  nome: string;
  bairro: string;
  latitude: number;
  longitude: number;
  servicos: number;
}

export function MapaCalorUnidades({ pontos }: { pontos: PontoCobertura[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current || pontos.length === 0) {
      return;
    }

    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-49.8797, -6.4988],
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      antialias: true,
      cooperativeGestures: true,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("load", () => {
      map.addSource("cobertura-unidades", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: pontos.map((ponto) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [ponto.longitude, ponto.latitude],
            },
            properties: {
              id: ponto.id,
              nome: ponto.nome,
              bairro: ponto.bairro,
              servicos: ponto.servicos,
            },
          })),
        },
      });

      map.addLayer({
        id: "calor-cobertura",
        type: "heatmap",
        source: "cobertura-unidades",
        maxzoom: 16,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "servicos"],
            0,
            0,
            9,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            1.15,
            15,
            2.8,
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            30,
            15,
            58,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0.9,
            16,
            0.35,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(255,255,255,0)",
            0.12,
            "rgba(88, 220, 255, 0.45)",
            0.35,
            "rgba(65, 221, 151, 0.65)",
            0.58,
            "rgba(255, 219, 92, 0.82)",
            0.78,
            "rgba(255, 112, 72, 0.9)",
            1,
            "rgba(181, 24, 75, 0.98)",
          ],
        },
      });

      map.addLayer({
        id: "pontos-cobertura",
        type: "circle",
        source: "cobertura-unidades",
        minzoom: 12.5,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12.5, 4, 16, 9],
          "circle-color": "#ffffff",
          "circle-stroke-color": "#651c35",
          "circle-stroke-width": 2.5,
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 12.5, 0, 14, 1],
        },
      });

      map.addLayer({
        id: "rotulos-cobertura",
        type: "symbol",
        source: "cobertura-unidades",
        minzoom: 13.5,
        layout: {
          "text-field": ["to-string", ["get", "servicos"]],
          "text-size": 10,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#651c35",
          "text-halo-color": "#ffffff",
          "text-halo-width": 0.5,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      pontos.forEach((ponto) => bounds.extend([ponto.longitude, ponto.latitude]));
      map.fitBounds(bounds, { padding: 52, maxZoom: 13.5, duration: 0 });

      map.on("click", "pontos-cobertura", (event) => {
        const feature = event.features?.[0] as unknown as
          | {
              geometry: { type: string; coordinates: [number, number] };
              properties: {
                nome?: string;
                bairro?: string;
                servicos?: number;
              };
            }
          | undefined;
        if (!feature || feature.geometry.type !== "Point") return;
        const properties = feature.properties;
        new mapboxgl.Popup({ offset: 12, maxWidth: "280px" })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(
            `<div style="font:600 13px/1.35 system-ui;color:#241b23">${escapeHtml(properties.nome ?? "Unidade")}</div>` +
              `<div style="margin-top:4px;font:12px/1.4 system-ui;color:#655b63">${escapeHtml(properties.bairro ?? "Sem bairro")} · ${Number(properties.servicos ?? 0)} serviços disponíveis</div>`,
          )
          .addTo(map);
      });

      map.on("mouseenter", "pontos-cobertura", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "pontos-cobertura", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pontos]);

  if (!TOKEN) {
    return <EstadoVazio texto="Configure o token público do Mapbox para exibir o mapa." />;
  }
  if (pontos.length === 0) {
    return <EstadoVazio texto="Cadastre coordenadas nas unidades para formar o mapa de calor." />;
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#101820] shadow-sm">
        <div
          ref={containerRef}
          className="h-[440px]"
          role="img"
          aria-label={`Mapa de calor da cobertura de ${pontos.length} unidades de saúde sobre imagem de satélite`}
        />
        <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-white/20 bg-[#151019]/85 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
            Cobertura territorial
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {pontos.length} unidades mapeadas
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>Menor cobertura</span>
        <span className="h-2.5 w-32 rounded-full bg-gradient-to-r from-[#58dcff] via-[#ffdb5c] to-[#b5184b]" />
        <span>Maior concentração de serviços</span>
        <span className="sm:ml-auto">Imagem de satélite · aproxime para identificar cada unidade.</span>
      </div>
    </div>
  );
}

function EstadoVazio({ texto }: { texto: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line bg-mist px-6 text-center">
      <Icon name="pin" className="h-6 w-6 text-muted" />
      <p className="max-w-sm text-sm text-muted">{texto}</p>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
