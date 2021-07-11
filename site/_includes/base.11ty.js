const html = String.raw;

exports.render = function ({ content }) {
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
