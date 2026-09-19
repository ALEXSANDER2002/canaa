import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-5xl font-bold text-plum-500">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink">Página não encontrada</h1>
        <p className="mt-2 text-muted">
          O endereço que você procura não existe.
        </p>
        <Link href="/">
          <Button className="mt-6">Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
