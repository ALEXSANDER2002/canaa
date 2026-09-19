import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { BrandMark } from "@/components/ui/icon";
import { AuthArt } from "@/components/ui/illustrations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[0.9fr_1.1fr]">
      {/* Lado editorial (oculto no mobile) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_75%_28%,#ef8e91_0%,transparent_38%),linear-gradient(145deg,#8a2735_0%,#c93750_58%,#e75b68_100%)] p-12 text-white lg:flex">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandMark className="h-7 w-7 text-plum-200" centerColor="var(--color-clay-400)" />
          <span className="font-display text-xl font-semibold text-white">
            Canaã <span className="italic text-plum-200">Delas</span>
          </span>
        </Link>

        <AuthArt className="relative z-10 my-4 max-w-sm self-center drop-shadow-xl" />

        <blockquote className="max-w-md">
          <p className="font-display text-4xl leading-tight text-white">
            Cuidado que acompanha cada fase da sua vida.
          </p>
          <footer className="mt-5 text-sm text-plum-200">
            Saúde, acolhimento e informação perto de você.
          </footer>
        </blockquote>

        <p className="text-sm text-plum-200/80">
          Canaã dos Carajás, PA
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-5 sm:p-10 lg:p-16">
        <div className="w-full max-w-[430px] rounded-[var(--radius-frame)] border border-line/70 bg-white p-6 shadow-[0_24px_80px_-50px_rgba(58,30,37,0.35)] sm:p-10">
          <div className="mb-10 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
