exports.data = {
  permalink: "feed.json",
  eleventyExcludeFromCollections: true,
};

exports.render = async function ({ site, collections }) {
  const posts = collections.post?.filter((post) => !post?.draft).reverse() || []
  const items = await Promise.all(
    posts.map(async ({ url, data, templateContent, date }) => {
      const absolutePostUrl = this.absoluteUrl(this.url(url), site.url)
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
    title: site.title,
    home_page_url: site.url,
    feed_url: site.url + "/feed.json",
    description: site.desc,
    authors: [
      {
        name: site.author,
        url: site.url,
      },
    ],
    items,
  };

  return JSON.stringify(data);
};
