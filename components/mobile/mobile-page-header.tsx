import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface MobilePageHeaderProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
}

export function MobilePageHeader({ backHref, backLabel, title, subtitle }: MobilePageHeaderProps) {
  const cleanLabel = backLabel.replace(/^←\s*/, "").replace(/^back to\s*/i, "");

  return (
    <header className="mb-4 border-b border-white/10 pb-4">
      <Link
        href={backHref}
        className="inline-flex min-h-[36px] items-center gap-1 -ml-1 pl-1 pr-2 font-mono text-[11px] uppercase tracking-wider text-primary active:text-primary/70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span>{cleanLabel}</span>
      </Link>
      <h1 className="mt-1.5 font-display text-[1.45rem] font-black uppercase leading-[1.05] text-white">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-white/55">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
