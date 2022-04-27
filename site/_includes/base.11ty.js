const html = String.raw;

exports.render = function ({ site, content, page, title, description }) {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta name="description" content="${description || site.desc}" />
        <link rel="canonical" href=${site.url + page.url} />
        <link href="https://unpkg.com/prismjs@1.20.0/themes/prism-okaidia.css" rel="stylesheet">
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
        <link rel="stylesheet" href="/assets/main.css" />
      </head>
      <body>
        <header>
          <h1><a href="/">thickrocks</a></h1>
          <div>
            <a href="mailto:${site.social.email}">Email</a>
            <a href="https://discordapp.com/channels/@me/${site.social.discord}">Discord</a>
            <a href="https://twitter.com/${site.social.twitter}">Twitter</a>
            <a href="https://github.com/${site.social.github}">GitHub</a>
          </div>
        </header>
        <main>${content}</main>
        <footer>
          <a href="https://keyoxide.org/${site.social.keyoxide}">Keyoxide</a>
        </footer>
      </body>
    </html>`;
};
