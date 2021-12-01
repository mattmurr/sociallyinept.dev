const html = String.raw;

const posts = (posts) => {
  if (posts.len < 1) return []
  return posts.filter((post) => !post.data?.draft)
    .map(
      ({ data, url, date }) => html`<li>
        ${this.postDate(date)}
        <a href="${this.url(url)}">${data.title}</a>
      </li>`
    )
    .join("\n");
};

exports.data = {
  layout: "base",
};

exports.render = function ({ content, collections }) {
  return html`${content}
  <section class="posts">
    <h2>Posts</h2>
    <ul>
      ${posts(collections.post)}
    </ul>
  </section>`;
};
