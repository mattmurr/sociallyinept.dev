const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const Image = require("@11ty/eleventy-img");
const pluginRss = require("@11ty/eleventy-plugin-rss");

async function imageShortcode(src, alt) {
  const sizes = "(min-width: 1024px), 100vw, 50vw";
  const metadata = await Image(src, {
    widths: [600, 900, 1500],
    formats: ["webp", "png", "jpeg"],
    urlPath: "/img/",
    outputDir: "_site/img/",
    sharpWebpOptions: {
      nearLossless: true,
    }
  });

  const imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes, {
    whitespaceMode: "inline",
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  ["dateToRfc3339", "absoluteUrl", "convertHtmlToAbsoluteUrls"].forEach(
    (method) => eleventyConfig.addFilter(method, pluginRss[method])
  );

  eleventyConfig.addFilter("postDate", (date) =>
    DateTime.fromJSDate(date).setLocale("en-gb").toLocaleString({ month: 'long', day: '2-digit', year: 'numeric' })
  );

  eleventyConfig.addLiquidShortcode("image", imageShortcode);

  eleventyConfig.addPassthroughCopy("assets");
};
