// Gera o PDF do pitch a partir do HTML, usando o Chrome ou o Edge já
// instalados (modo headless). Uso: node docs/gerar-pitch-pdf.mjs
// Slides em 1280x720 (16:9) — o tamanho vem do @page do próprio HTML.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const html = resolve(here, "pitch.html");
const pdf = resolve(here, "Canaa-Delas-AI-Pitch.pdf");

const CANDIDATOS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const navegador = CANDIDATOS.find((p) => existsSync(p));
if (!navegador) {
  console.error("Nenhum navegador baseado em Chromium encontrado.");
  process.exit(1);
}
if (!existsSync(html)) {
  console.error(`Arquivo não encontrado: ${html}`);
  process.exit(1);
}

const resultado = spawnSync(
  navegador,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    // Folga para a fonte Manrope (Google Fonts) carregar antes da impressão.
    "--virtual-time-budget=10000",
    `--print-to-pdf=${pdf}`,
    `file://${html.replace(/\\/g, "/")}`,
  ],
  { stdio: "inherit" },
);

process.exit(resultado.status ?? 0);
