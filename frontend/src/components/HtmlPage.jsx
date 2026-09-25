import { useEffect, useRef } from "react";

/**
 * Generic wrapper that renders a converted static HTML page inside React
 * WITHOUT modifying any of the original markup, CSS or JavaScript.
 *
 * - `style`    : the exact contents of the original <style> tag
 * - `bodyHtml` : the exact contents of the original <body> tag (minus <script> tags)
 * - `scripts`  : the exact contents of each original <script> tag, in order
 * - `title`    : the exact contents of the original <title> tag
 */
export default function HtmlPage({ title, style, bodyHtml, scripts }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    const injectedScripts = [];

    (scripts || []).forEach((code) => {
      const scriptEl = document.createElement("script");
      // Executing via a real <script> element (instead of eval/new Function)
      // preserves the original script's global scope, so functions declared
      // in it (e.g. onclick="closeModal()") keep working exactly as before.
      scriptEl.text = code;
      document.body.appendChild(scriptEl);
      injectedScripts.push(scriptEl);
    });

    return () => {
      injectedScripts.forEach((el) => el.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyHtml]);

  return (
    <>
      {style ? <style dangerouslySetInnerHTML={{ __html: style }} /> : null}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </>
  );
}
