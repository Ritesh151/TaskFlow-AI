'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface BrainMarkdownProps {
  content: string;
  className?: string;
}

export function BrainMarkdown({ content, className }: BrainMarkdownProps) {
  return (
    <div className={cn('space-y-4 text-sm leading-7 text-gray-700', className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-semibold text-gray-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900">{children}</h3>,
          p: ({ children }) => <p className="text-sm leading-7 text-gray-700">{children}</p>,
          ul: ({ children }) => <ul className="space-y-2 pl-5 text-gray-700 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-2 pl-5 text-gray-700 list-decimal">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="text-gray-600">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline decoration-blue-400/40 underline-offset-4"
            >
              {children}
            </a>
          ),
          code({ children, className: codeClassName, ...props }) {
            const inline = 'inline' in props && Boolean(props.inline);
            const language = /language-(\w+)/.exec(codeClassName || '')?.[1];
            const code = String(children).replace(/\n$/, '');

            if (inline || !language) {
              return (
                <code className="rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[13px] text-pink-600">
                  {code}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(2,6,23,0.92)',
                  padding: '1rem',
                  fontSize: '13px',
                }}
                codeTagProps={{ style: { fontFamily: 'var(--font-geist), monospace' } }}
              >
                {code}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
