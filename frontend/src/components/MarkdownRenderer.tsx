import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";

interface MarkdownRendererProps {
  content: string;
  style?: React.CSSProperties;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  style,
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headers
        h1: ({ children }) => (
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "600",
              margin: "0 0 1rem 0",
              color: "rgba(0, 0, 0, 0.9)",
            }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              margin: "0 0 0.75rem 0",
              color: "rgba(0, 0, 0, 0.9)",
            }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              margin: "0 0 0.5rem 0",
              color: "rgba(0, 0, 0, 0.9)",
            }}
          >
            {children}
          </h3>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p
            style={{
              margin: "0 0 0.75rem 0",
              lineHeight: "1.6",
              color: "rgba(0, 0, 0, 0.8)",
            }}
          >
            {children}
          </p>
        ),

        // Bold text
        strong: ({ children }) => (
          <strong
            style={{
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.9)",
            }}
          >
            {children}
          </strong>
        ),

        // Italic text
        em: ({ children }) => (
          <em
            style={{
              fontStyle: "italic",
              color: "rgba(0, 0, 0, 0.8)",
            }}
          >
            {children}
          </em>
        ),

        // Lists
        ul: ({ children }) => (
          <ul
            style={{
              margin: "0 0 0.75rem 0",
              paddingLeft: "1.25rem",
              listStyleType: "disc",
            }}
          >
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol
            style={{
              margin: "0 0 0.75rem 0",
              paddingLeft: "1.25rem",
              listStyleType: "decimal",
            }}
          >
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li
            style={{
              margin: "0.25rem 0",
              lineHeight: "1.5",
              color: "rgba(0, 0, 0, 0.8)",
            }}
          >
            {children}
          </li>
        ),

        // Tables
        table: ({ children }) => (
          <div style={{ overflowX: "auto", margin: "1rem 0" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: "0.5rem",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead
            style={{
              background: "rgba(59, 130, 246, 0.1)",
            }}
          >
            {children}
          </thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr
            style={{
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th
            style={{
              padding: "0.75rem",
              textAlign: "left",
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.9)",
              fontSize: "0.875rem",
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            style={{
              padding: "0.75rem",
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.8)",
              lineHeight: "1.4",
            }}
          >
            {children}
          </td>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote
            style={{
              margin: "0.75rem 0",
              padding: "0.75rem 1rem",
              borderLeft: "4px solid rgba(59, 130, 246, 0.5)",
              background: "rgba(59, 130, 246, 0.05)",
              borderRadius: "0.375rem",
              fontStyle: "italic",
              color: "rgba(0, 0, 0, 0.8)",
            }}
          >
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => (
          <hr
            style={{
              margin: "1.5rem 0",
              border: "none",
              height: "1px",
              background: "rgba(0, 0, 0, 0.1)",
            }}
          />
        ),

        // Links
        a: ({ children, href }) => (
          <a
            href={href}
            style={{
              color: "rgba(59, 130, 246, 0.8)",
              textDecoration: "underline",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
      style={style}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
