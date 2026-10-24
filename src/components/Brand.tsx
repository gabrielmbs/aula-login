import Image from "next/image";
import Link from "next/link";

export function Brand({
  light = false,
  subtitle = false,
}: {
  light?: boolean;
  subtitle?: boolean;
}) {
  return (
    <Link
      className="brand"
      href={light ? "/login" : "/dashboard"}
      aria-label="CadastroWeb, início"
    >
      <Image
        className="brand-mark"
        src={light ? "/brand-mark-light.svg" : "/brand-mark.svg"}
        width={40}
        height={40}
        alt=""
        priority
      />
      <span className="brand-name">
        CadastroWeb
        {subtitle && <span className="brand-subtitle">Gestão de pessoas</span>}
      </span>
    </Link>
  );
}
