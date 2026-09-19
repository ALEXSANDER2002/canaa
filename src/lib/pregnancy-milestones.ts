// Marcos informativos por faixa de semanas de gestação.
// Conteúdo educativo genérico — não substitui orientação médica.
const milestones: { upTo: number; text: string }[] = [
  { upTo: 4, text: "O embrião está se implantando. Comece o pré-natal e o ácido fólico." },
  { upTo: 8, text: "Formação dos principais órgãos. Enjoos são comuns nesta fase." },
  { upTo: 12, text: "Fim do 1º trimestre. O risco de complicações diminui." },
  { upTo: 16, text: "O bebê já se movimenta, embora você ainda não sinta." },
  { upTo: 20, text: "Metade do caminho! Ultrassom morfológico costuma ser feito agora." },
  { upTo: 24, text: "Você começa a sentir os movimentos com mais frequência." },
  { upTo: 28, text: "Início do 3º trimestre. Atenção à pressão e à glicemia." },
  { upTo: 32, text: "O bebê ganha peso rapidamente. Consultas ficam mais frequentes." },
  { upTo: 36, text: "Prepare a bolsa da maternidade e o plano de parto." },
  { upTo: 40, text: "Reta final! O bebê pode chegar a qualquer momento." },
  { upTo: Infinity, text: "Você chegou ao termo. Mantenha o acompanhamento médico." },
];

export function milestoneForWeek(weeks: number): string {
  return milestones.find((m) => weeks <= m.upTo)?.text ?? milestones[0].text;
}
