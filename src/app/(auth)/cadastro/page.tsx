import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight text-ink">Vamos começar?</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Crie sua conta gratuita para acompanhar sua jornada.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-plum-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
