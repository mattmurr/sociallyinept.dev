const html = String.raw;

exports.render = function ({ site, content, page, title, description }) {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta
          name="description"
          content="${description || site.desc}"
        />
        <link rel="canonical" href=${site.url + page.url} />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
        <link rel="manifest" href="/assets//site.webmanifest">
        <link href="/assets/main.css" rel="stylesheet"/>
      </head>
      <body>
        <div class="container">
          <header>
            <h1><a href="/">thickrocks</a></h1>
            <div>
              <a href="mailto:${site.social.email}">Email</a>
              <a href="${site.social.mastodon}">Mastodon</a>
              <a href="${site.social.sourcehut}">sourcehut</a>
            </div>
          </header>
          <main>
            ${content}
          </main>
        </div>
        <footer>
          <a href="${site.social.keyoxide}">Keyoxide</a>
        </footer>
      </body>
    </html>`;
};
