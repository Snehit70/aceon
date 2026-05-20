import Link from "next/link";

interface MobilePageHeaderProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
}

export function MobilePageHeader({ backHref, backLabel, title, subtitle }: MobilePageHeaderProps) {
  return (
    <header className="mb-4 border-b border-white/10 pb-3">
      <Link href={backHref} className="font-mono text-xs uppercase tracking-wider text-primary">
        {backLabel}
      </Link>
      <h1 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">{title}</h1>
      {subtitle ? (
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/60">{subtitle}</p>
      ) : null}
    </header>
  );
}
