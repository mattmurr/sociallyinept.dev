const html = String.raw;

exports.data = {
  layout: "base",
};

const posts = (posts) => {
  return posts
    .map(
      ({ data, url, date }) => html`<li>
        <a href="${this.url(url)}">${data.title}</a>
        <span> ${this.postDate(date)}</span>
      </li>`
    )
    .join("\n");
};

exports.render = function ({ title, content, collections }) {
  return html` <!DOCTYPE html>
    ${content}
    <h3>Links</h3>
    <ul>
      <li><a href="https://github.com/mattmurr">GitHub</a></li>
      <li><a href="https://twitter.com/mattmurr__">Twitter</a></li>
      <li><a href="https://github.com/mattmurr/compti.me">Source</a></li>
      <li><a href="mailto:mattmurr.uk@gmail.com">Mail</a></li>
    </ul>

    <h3>Posts</h3>
    <ul>
      ${posts(collections.post)}
    </ul>`;
};
