# DTS React App (converted from static HTML)

This project is a direct React/Vite conversion of the 7 original static
HTML files. **No HTML, CSS or JavaScript code was rewritten or modified** —
each page's original `<style>`, body markup and `<script>` content were
extracted as-is and are rendered unchanged inside a small React wrapper.

## How the conversion works

- `src/pages/data/*Data.js` — the exact original `title`, `style`
  (contents of the `<style>` tag), `bodyHtml` (contents of `<body>`,
  scripts removed) and `scripts` (exact contents of every `<script>` tag,
  in order) for each page, stored as plain strings.
- `src/components/HtmlPage.jsx` — a generic component that:
  - injects the page's original `<style>` block,
  - renders the page's original body markup untouched,
  - re-executes the page's original `<script>` blocks (as real `<script>`
    elements, so global functions like `onclick="closeModal()"` still work
    exactly like they did in the static HTML).
- `src/pages/*.jsx` — one tiny component per original file (`Home`,
  `About`, `Services`, `Products`, `Faq`, `Contact`, `GetAQuote`) that just
  feeds its data into `HtmlPage`.
- `src/App.jsx` — React Router routes named after the original filenames
  (`/about.html`, `/services.html`, `/products.html`, `/faq.html`,
  `/contact.html`, `/get-a-quote.html`), plus `/` and `/index.html` for the
  home page. Because the routes match the original filenames, **every
  existing link in the pages** (e.g. `href="about.html"`) keeps working
  without being edited.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL — the home page (originally `index.html`)
renders on the `/` route, exactly as requested.

To build for production:

```bash
npm run build
npm run preview
```
