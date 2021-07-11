const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt) {
  const sizes = "(min-width: 1024px), 100vw, 50vw";
  const metadata = await Image(src, {
    widths: [600, 900, 1500],
    formats: ["webp", "jpeg"],
    urlPath: "/img/",
    outputDir: "site/output/img/",
    sharpWebpOptions: {
      nearLossless: true,
    },
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

  eleventyConfig.addFilter("postDate", (date) =>
    DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)
  );

  eleventyConfig.addLiquidShortcode("image", imageShortcode);

  eleventyConfig.addPassthroughCopy("site/assets");

  return {
    dir: {
      input: "site",
      output: "site/output",
    },
  };
};
