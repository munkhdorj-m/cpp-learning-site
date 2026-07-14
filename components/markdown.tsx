import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed space-y-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-4 mb-2 tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mt-3 mb-1.5">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-bold mt-2 mb-1">{children}</h4>
          ),
          p: ({ children }) => <p className="my-2">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className={className}>
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1 py-0.5 rounded bg-muted text-[0.875em] font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono leading-relaxed">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-violet-300 dark:border-violet-700 pl-3 italic my-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-4 border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border px-2 py-1 bg-muted text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border px-2 py-1">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
