import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Server Actions são usadas para as mutações de dados das features.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  /**
   * CORS apenas em desenvolvimento, para o app Expo rodando no navegador
   * (Metro na :8081 falando com o Next na :3000).
   *
   * O app no celular não passa por CORS, e em produção ele aponta direto para
   * a origem da API — por isso a liberação fica restrita ao dev. A API
   * autentica por Bearer, não por cookie, então não há risco de requisição
   * autenticada automaticamente a partir de outro site.
   */
  async headers() {
    if (!isDev) return [];

    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
