import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight text-ink">Que bom ter você aqui.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Entre para continuar de onde parou.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-plum-700 hover:underline">
          Criar conta
        </Link>
      </p>

      <div className="mt-7 rounded-[var(--radius-card)] border border-plum-100 bg-plum-50/60 px-4 py-3 text-center text-xs leading-5 text-muted">
        Conta de demonstração: <strong>maria@example.com</strong> · senha{" "}
        <strong>senha1234</strong>
      </div>
    </div>
  );
}
