import React from "react";
import { getDocBySlug } from "@/lib/docs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { Mermaid } from "@/components/ui/mermaid";

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return { title: "PostPipe Documentation" };
  return {
    title: `${doc.frontmatter.title || "Docs"} - PostPipe`,
    description: doc.frontmatter.description || "PostPipe Documentation",
  };
}

// Remove emoji characters from a string
function stripEmojis(str: string): string {
  return str
    .replace(
      /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}]|\u{FE0F}|\u{20E3}/gu,
      ""
    )
    .replace(/^\s+/, "")
    .trim();
}

function cleanNode(child: React.ReactNode): React.ReactNode {
  if (typeof child === "string") return stripEmojis(child);
  if (Array.isArray(child)) return child.map(cleanNode);
  return child;
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) notFound();

  const isIntro = slug.length === 1 && slug[0] === "introduction";

  return (
    <div className="py-10 max-w-4xl">
      {/* Breadcrumb */}
      {!isIntro && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/docs/introduction" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{doc.frontmatter.title}</span>
        </nav>
      )}

      {/* Page Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {doc.frontmatter.title || "Documentation"}
        </h1>
        {doc.frontmatter.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {doc.frontmatter.description}
          </p>
        )}
        {isIntro && (
          <div className="flex gap-3 mt-5">
            <Link
              href="/docs/guides/static-connector"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 transition-colors"
            >
              Static Setup
            </Link>
            <Link
              href="/docs/guides/cli-components"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-transparent text-foreground hover:bg-muted h-9 px-5 transition-colors"
            >
              Forge CLI
            </Link>
          </div>
        )}
      </header>

      {/* Markdown Body */}
      <div className="prose prose-sm max-w-none dark:prose-invert
        prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-24
        prose-h2:text-lg prose-h2:mt-10 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-muted-foreground prose-p:leading-7 prose-p:my-3
        prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-em:text-muted-foreground
        prose-ul:my-3 prose-li:my-0.5 prose-li:text-muted-foreground
        prose-ol:my-3
        prose-code:text-[0.82em] prose-code:font-mono prose-code:bg-muted prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-5 prose-pre:my-5 prose-pre:overflow-x-auto prose-pre:text-[0.82em]
        prose-blockquote:border-l-2 prose-blockquote:border-primary/60 prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:my-4
        prose-table:text-sm prose-th:text-foreground prose-th:font-semibold prose-td:text-muted-foreground prose-thead:border-border prose-tbody:border-border
        prose-hr:border-border prose-hr:my-6
        [&_hr]:my-6
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1>{cleanNode(children)}</h1>,
            h2: ({ children }) => <h2>{cleanNode(children)}</h2>,
            h3: ({ children }) => <h3>{cleanNode(children)}</h3>,
            h4: ({ children }) => <h4>{cleanNode(children)}</h4>,
            // Clean task-list item rendering
            li: ({ children, className, ...props }: any) => {
              const isTask = className?.includes("task-list-item");
              if (isTask) {
                return (
                  <li className="!list-none flex items-start gap-2 !pl-0 !ml-0" {...props}>
                    {children}
                  </li>
                );
              }
              return <li {...props}>{children}</li>;
            },
            // Replace raw checkbox inputs with styled spans
            input: ({ type, checked }: any) => {
              if (type !== "checkbox") return null;
              return (
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-[4px] border shrink-0 mt-0.5 ${
                    checked
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40 bg-muted"
                  }`}
                >
                  {checked && <Check size={9} className="text-primary-foreground" strokeWidth={3} />}
                </span>
              );
            },
            // Mermaid diagrams
            code({ node, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              if (match?.[1] === "mermaid") {
                return <Mermaid chart={String(children).replace(/\n$/, "")} />;
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
