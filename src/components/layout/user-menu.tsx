import { logoutAction } from "@/server/actions/auth";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-muted">{email}</p>
      </div>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-plum-700 font-display text-sm font-semibold text-white">
        {initials(name)}
      </span>
      <form action={logoutAction}>
        <Button variant="ghost" size="sm" type="submit">
          Sair
        </Button>
      </form>
    </div>
  );
}
