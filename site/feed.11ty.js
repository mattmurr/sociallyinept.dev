exports.data = {
  permalink: "feed.json",
  eleventyExcludeFromCollections: true,
  metadata: {
    title: "compti.me",
    subtitle:
      "Blog about Software Engineering, Cloud, Unix and various other tech",
    url: "https://compti.me",
    feedUrl: "https://compti.me/feed.xml",
    author: {
      name: "Matthew Murray",
    },
  },
};

exports.render = async function ({ metadata, collections }) {
  const posts = collections.post.filter((post) => !post?.draft).reverse();
  const items = await Promise.all(
    posts.map(async ({ url, data, templateContent, date }) => {
      const absolutePostUrl = this.absoluteUrl(this.url(url));
      const absolutePostHtml = this.convertHtmlToAbsoluteUrls(
        templateContent,
        absolutePostUrl
      );
      return {
        id: absolutePostUrl,
        url: absolutePostUrl,
        title: data.title,
        content_html: (await absolutePostHtml) || "",
        date_published: this.dateToRfc3339(date),
      };
    })
  );

  const data = {
    version: "https://jsonfeed.org/version/1.1",
    title: metadata.title,
    home_page_url: metadata.url,
    feed_url: metadata.feedUrl,
    description: metadata.subtitle,
    authors: [
      {
        name: metadata.author.name,
        url: metadata.url,
      },
    ],
    items,
  };

  return JSON.stringify(data);
};
