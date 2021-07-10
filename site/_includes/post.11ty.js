const html = String.raw;

exports.data = {
  layout: "base",
};

exports.render = ({ title, content }) => {
  return html` <article>
    <h3>${title}</h3>
    ${content}
  </article>`;
};
