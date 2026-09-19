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
      style: "mapbox://styles/mapbox/light-v11",
      center: [-49.8797, -6.4988],
      zoom: 12,
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
            7,
            1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.8,
            15,
            2.4,
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            26,
            15,
            52,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0.8,
            16,
            0.25,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(255,255,255,0)",
            0.2,
            "#eadde8",
            0.45,
            "#d78aa0",
            0.7,
            "#b62f51",
            1,
            "#651c35",
          ],
        },
      });

      map.addLayer({
        id: "pontos-cobertura",
        type: "circle",
        source: "cobertura-unidades",
        minzoom: 12.5,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12.5, 4, 16, 8],
          "circle-color": "#ffffff",
          "circle-stroke-color": "#9f2947",
          "circle-stroke-width": 2,
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 12.5, 0, 14, 1],
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
        new mapboxgl.Popup({ offset: 10 })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(
            `<strong>${escapeHtml(properties.nome ?? "Unidade")}</strong>` +
              `<div>${escapeHtml(properties.bairro ?? "Sem bairro")} · ${Number(properties.servicos ?? 0)} serviços</div>`,
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
      <div
        ref={containerRef}
        className="h-[360px] overflow-hidden rounded-[var(--radius-card)] border border-line"
        role="img"
        aria-label={`Mapa de calor da cobertura de ${pontos.length} unidades de saúde`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>Menor cobertura</span>
        <span className="h-2.5 w-28 rounded-full bg-gradient-to-r from-[#eadde8] via-[#d78aa0] to-[#651c35]" />
        <span>Maior concentração de serviços</span>
        <span className="sm:ml-auto">Aproxime o mapa para identificar as unidades.</span>
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
