import Link from "next/link";
import { Plus } from "lucide-react";

export function PageHeader({
  title,
  description,
  showCreate = false,
}: {
  title: string;
  description: string;
  showCreate?: boolean;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {showCreate && (
        <Link className="button button--primary" href="/dashboard/pessoas/nova">
          <Plus size={18} strokeWidth={2.5} />
          Nova pessoa
        </Link>
      )}
    </div>
  );
}
