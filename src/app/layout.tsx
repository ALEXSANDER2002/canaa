import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { MascoteGlobal } from "@/components/features/mascote-global";

/**
 * Duas famílias, cada uma com um trabalho.
 *
 * Antes o app inteiro — título e texto corrido — usava a mesma geométrica em
 * pesos diferentes, que é como a maioria dos gerador automático de site
 * resolve tipografia: rápido, mas sem voz nenhuma. Fraunces é uma serifada
 * quente e um pouco torta nas curvas — o contraponto editorial que dá à marca
 * uma cara que não é a de qualquer outro app de saúde. Karla carrega o texto
 * corrido: humanista, boa altura-x, sem ser mais uma das "sans" que todo
 * gerador de UI escolhe por padrão.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
});

export const metadata: Metadata = {
  title: {
    default: "Canaã Delas AI — Saúde feminina inteligente",
    template: "%s · Canaã Delas AI",
  },
  description:
    "Plataforma inteligente de saúde feminina para Canaã dos Carajás: ciclo menstrual, gestação, bem-estar emocional e lembretes de exames, com orientação personalizada por IA.",
  keywords: [
    "saúde feminina",
    "femtech",
    "ciclo menstrual",
    "gestação",
    "bem-estar",
    "Canaã dos Carajás",
  ],
  authors: [{ name: "Canaã Delas AI" }],
  openGraph: {
    title: "Canaã Delas AI",
    description:
      "Tecnologia que cuida, conecta e transforma a vida das mulheres.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  // Mesmo coral do botão primário (plum-700) — a barra do sistema precisa
  // soar como a marca, não como uma aproximação.
  themeColor: "#d1354a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${karla.variable}`}>
      <body>
        {children}
        {/*
          O mascote fica aqui, no layout raiz, para aparecer em qualquer tela —
          inclusive antes do login. Este layout NÃO lê a sessão (nem pode: ler
          cookie aqui tornaria o site inteiro dinâmico e tiraria a landing do
          cache estático). O mascote descobre sozinho, no navegador, o que
          dizer a quem está ali — ver `/api/v1/mascote`.
        */}
        <MascoteGlobal />
      </body>
    </html>
  );
}
