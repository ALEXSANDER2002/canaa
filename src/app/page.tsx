import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Icon, BrandMark, type IconName } from "@/components/ui/icon";
import { HeroArt } from "@/components/ui/illustrations";
import { PhoneMockup } from "@/components/ui/phone-mockup";

const features: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "cycle",
    title: "Ciclo menstrual",
    description:
      "Descubra o que é normal para você. Identifique padrões nos sintomas e saiba quando sua menstruação deve chegar.",
  },
  {
    icon: "pregnancy",
    title: "Gestação",
    description:
      "Acompanhe o bebê semana a semana, com os marcos de cada fase e a data provável do parto.",
  },
  {
    icon: "wellbeing",
    title: "Bem-estar emocional",
    description:
      "Registre como se sente e perceba o que afeta seu humor ao longo do ciclo — com leveza e sem julgamento.",
  },
  {
    icon: "reminder",
    title: "Lembretes e exames",
    description:
      "Nunca perca um preventivo. Receba lembretes de exames e consultas no momento certo.",
  },
  {
    icon: "shield",
    title: "Proteção e direitos",
    description:
      "Encontre uma rede de apoio, seus direitos e caminhos seguros para pedir ajuda quando precisar.",
  },
  {
    icon: "guide",
    title: "Assistente e comunidade",
    description:
      "Tire dúvidas com acolhimento, leia relatos e descubra ações que estão acontecendo na sua cidade.",
  },
];

const trustPillars: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "shield",
    title: "Privacidade em primeiro lugar",
    description: "Seus dados são só seus. Nunca vendemos suas informações.",
  },
  {
    icon: "guide",
    title: "Conteúdo responsável",
    description: "Informações educativas, claras e sem alarmismo.",
  },
  {
    icon: "home",
    title: "Feito para Canaã",
    description: "Pensado para a realidade das mulheres de Canaã dos Carajás.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 border-b border-line/70 bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Logo />
          <nav className="flex items-center gap-1.5">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Criar conta</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line/60 bg-[radial-gradient(circle_at_84%_24%,#ffe7e3_0%,transparent_32%),linear-gradient(150deg,#fffaf7_0%,#f8eeeb_100%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div className="text-center lg:text-left">
          <h1 className="text-balance text-[clamp(2.8rem,5.2vw,4.8rem)] leading-[1.05] tracking-[-0.015em] text-ink">
            Um espaço para cuidar de você, <span className="text-plum-700">por inteiro.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg lg:mx-0">
            Saúde, bem-estar, proteção e comunidade em um só lugar. Informação
            clara e apoio próximo para cada momento da sua vida.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/cadastro">
              <Button size="lg" className="shadow-lg shadow-plum-700/15">Começar gratuitamente <Icon name="arrow" className="h-4 w-4" /></Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted">No seu ritmo. Com seus dados sob seu controle.</p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md rounded-[var(--radius-frame)] border border-white/70 bg-white/35 p-5 shadow-[0_30px_80px_-40px_rgba(88,32,49,0.3)] sm:p-8">
          <HeroArt />
        </div>
        </div>
      </section>

      {/* Faixa de confiança */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-5 py-10 sm:grid-cols-3 sm:px-8">
          {trustPillars.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-plum-700 ring-1 ring-plum-100">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="mt-0.5 text-sm text-muted">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl text-ink sm:text-4xl">
              Cuidado que acompanha a vida real
            </h2>
            <p className="mt-3 text-muted">
              Recursos pensados para a realidade das mulheres de Canaã dos
              Carajás.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-[var(--radius-card)] border border-line/80 bg-white p-6 shadow-[0_12px_30px_-24px_rgba(44,31,33,0.25)] transition-transform hover:-translate-y-1">
                <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] bg-plum-50 text-plum-700">
                  <Icon name={f.icon} />
                </span>
                <h3 className="mt-5 text-lg text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mostruário — app no celular */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl text-ink sm:text-4xl">
              Seu cuidado inteiro, num só <span className="italic text-plum-700">lugar</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              A página inicial acompanha o seu momento e abre caminhos para
              saúde, bem-estar, proteção, comunidade e orientação. O ciclo é
              uma parte importante da sua jornada — não a única.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Atalhos claros para cada área do app",
                "Orientação, lembretes e informações locais no mesmo espaço",
                "Privacidade e acolhimento em todas as etapas",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-100 text-sage-600">
                    <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Diferencial IA — coral sólido, não o gradiente roxo-degradê que
          qualquer produto de "IA" usa por reflexo. A marca já tem cor
          própria; a seção não precisa emprestar a de ninguém. */}
      <section className="relative overflow-hidden bg-plum-800 text-white">
        <BrandMark
          className="pointer-events-none absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rotate-[8deg] text-white/[0.06] sm:h-96 sm:w-96"
          centerColor="transparent"
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-plum-300/40 text-plum-100">
            <Icon name="guide" className="h-6 w-6" />
          </span>
          <h2 className="mt-6 text-3xl text-white sm:text-4xl">
            Inteligência que <span className="italic">entende você</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white">
            A cada registro, a plataforma organiza o que importa e sugere o
            próximo passo — prevenção, autocuidado e autonomia, de um jeito que
            faz sentido para a sua vida.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-line bg-mist">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl text-ink sm:text-4xl">
            Sua saúde merece esse cuidado
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Crie sua conta gratuita e comece hoje mesmo.
          </p>
          <Link href="/cadastro" className="mt-8 inline-block">
            <Button size="lg">Criar minha conta</Button>
          </Link>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
          <Logo />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Canaã Delas · Canaã dos Carajás, PA
          </p>
        </div>
      </footer>
    </div>
  );
}
