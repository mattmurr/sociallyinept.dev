const html = String.raw;

const posts = (posts) => {
  return posts
    .filter((post) => !post.data?.draft)
    .map(
      ({ data, url, date }) => html`<li>
        <a href="${this.url(url)}">${data.title}</a>
        <span> ${this.postDate(date)}</span>
      </li>`
    )
    .join("\n");
};

exports.data = {
  layout: "base",
};

// TODO Generate links from a data file
exports.render = function ({ content, collections }) {
  return html` ${content}

    <h2>Posts</h2>
    <ul>
      ${posts(collections.post)}
    </ul>`;
};
