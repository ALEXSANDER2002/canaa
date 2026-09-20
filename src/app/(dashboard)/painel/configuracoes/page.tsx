import type { Metadata } from "next";

import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  GoalForm,
  PinForm,
  DeleteAccount,
} from "@/components/features/settings-forms";
import { MascoteSwitch } from "@/components/features/mascote-config";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { goal: true, pinHash: true, name: true, email: true },
  });

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Personalize sua experiência e gerencie seus dados."
      />

      <div className="space-y-6">
        <Card>
          <CardTitle>Objetivo</CardTitle>
          <CardDescription>
            Ajusta as previsões e as orientações que você recebe.
          </CardDescription>
          <div className="mt-4">
            <GoalForm current={user?.goal ?? null} />
          </div>
        </Card>

        <Card>
          <CardTitle>Mascote</CardTitle>
          <CardDescription>
            Aparece de vez em quando no canto da tela com avisos da cidade,
            dicas de saúde e lembretes do app. Nunca aparece na Proteção.
          </CardDescription>
          <div className="mt-4">
            <MascoteSwitch userId={sessionUser.id} />
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <Icon name="shield" className="mt-0.5 h-5 w-5 text-plum-700" />
            <div className="flex-1">
              <CardTitle>Privacidade &amp; segurança</CardTitle>
              <CardDescription>
                Seus dados são só seus. Nunca vendemos suas informações.
              </CardDescription>

              <div className="mt-4 space-y-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">
                    PIN de bloqueio
                  </p>
                  <PinForm hasPin={Boolean(user?.pinHash)} />
                </div>

                <div className="border-t border-line pt-5">
                  <p className="mb-1 text-sm font-medium text-ink">
                    Exportar meus dados
                  </p>
                  <p className="mb-3 text-sm text-muted">
                    Baixe uma cópia completa dos seus dados (LGPD).
                  </p>
                  <a href="/api/export" download>
                    <Button variant="outline" size="sm">
                      Baixar meus dados (JSON)
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-danger-200">
          <CardTitle className="text-danger-700">Zona de risco</CardTitle>
          <CardDescription>
            A exclusão da conta é permanente e apaga todos os seus registros.
          </CardDescription>
          <div className="mt-4">
            <DeleteAccount />
          </div>
        </Card>
      </div>
    </div>
  );
}
