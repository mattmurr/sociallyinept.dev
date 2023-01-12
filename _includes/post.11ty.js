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
    <a href="https://twitter.com/intent/tweet?text=Hey @${site.social.twitter}, ${title}">Start a discussion</a>
  </div>`;
};
