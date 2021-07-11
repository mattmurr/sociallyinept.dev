const html = String.raw;

exports.render = function ({ content, page }) {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>compti.me</title>
        <meta
          name="description"
          content="Blog about Software Engineering, Cloud, Unix and various other tech"
        />
        <link rel="canonical" href="https://compti.me${page.url}" />
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/assets/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/assets/favicon-16x16.png"
        />
        <link rel="manifest" href="/assets/site.webmanifest" />

        <link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/prismjs@1.24.1/themes/prism-tomorrow.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <header>
          <a href="/"><h1>compti.me</h1></a>
        </header>
        ${content}
      </body>
    </html> `;
};
