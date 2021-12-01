const html = String.raw;

exports.data = {
  layout: "base",
};

exports.render = ({ site, title, page, content }) => {
  return html`<article>
    <h2>${title}</h2>
    ${content}
  </article>
  <div class="discuss">
    <a href="mailto:${site.social.email}?subject=${title}">Start a discussion</a>
  </div>`;
};
