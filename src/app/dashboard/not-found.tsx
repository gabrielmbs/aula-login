import Link from "next/link";
import { ArrowLeft, UserRoundSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="data-state">
      <UserRoundSearch size={34} strokeWidth={1.4} />
      <h2>Cadastro não encontrado</h2>
      <p>Esta pessoa não existe ou o cadastro foi excluído.</p>
      <Link className="text-link" href="/dashboard/pessoas">
        <ArrowLeft size={16} />
        Voltar para pessoas
      </Link>
    </div>
  );
}
