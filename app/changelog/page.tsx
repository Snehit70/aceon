import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LegalShell, LegalHeading } from "@/components/shared/legal-shell";

/**
 * Reads the generated CHANGELOG.md and returns the release content only.
 *
 * The generator (scripts/generate-changelog.mjs) prefixes a `# Changelog`
 * heading and an intro sentence — both redundant here since LegalHeading already
 * supplies the title/subtitle, so we drop everything before the first release
 * (`## ...`). Returns null when the file is missing or has no releases yet, so
 * the page can fall back to the placeholder.
 */
async function readChangelog(): Promise<string | null> {
  let raw: string;
  try {
    raw = await readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  } catch {
    return null;
  }

  const firstRelease = raw.indexOf("\n## ");
  const body = (firstRelease === -1 ? "" : raw.slice(firstRelease + 1)).trim();
  return body.length > 0 ? body : null;
}

/** Themed renderers so the release notes match the Chainsaw Man aesthetic. */
const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-2xl font-display font-black uppercase mt-10 first:mt-0">
      {children}
      <span className="mt-3 block h-1 w-12 bg-primary" aria-hidden="true" />
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-display font-bold uppercase mt-6">{children}</h3>
  ),
  p: ({ children }) => <p className="text-neutral-300 leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-6 text-neutral-300 leading-relaxed">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-6 text-neutral-300 leading-relaxed">{children}</ol>
  ),
  li: ({ children }) => <li className="marker:text-primary">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-white transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
  code: ({ children }) => (
    <code className="bg-neutral-800 text-primary font-mono text-sm px-1.5 py-0.5 rounded-sm">
      {children}
    </code>
  ),
};

export default async function ChangelogPage() {
  const changelog = await readChangelog();

  return (
    <LegalShell showFooter={false}>
      <div className="flex flex-col items-center text-center space-y-10 sm:space-y-12">
        <LegalHeading subtitle="What's new in Aceon.">
          Change<span className="text-primary">log</span>
        </LegalHeading>

        {changelog ? (
          <article className="max-w-2xl w-full text-left space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {changelog}
            </ReactMarkdown>
          </article>
        ) : (
          <section className="max-w-2xl w-full">
            <div className="bg-neutral-900 border-2 border-neutral-800 p-8">
              <p className="text-neutral-300 leading-relaxed">
                Release notes are on the way. Check back here to see what&apos;s changed.
              </p>
            </div>
          </section>
        )}
      </div>
    </LegalShell>
  );
}
