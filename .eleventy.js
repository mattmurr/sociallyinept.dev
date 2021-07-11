const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addFilter("postDate", (date) =>
    DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)
  );

  eleventyConfig.addPassthroughCopy("site/assets");

  return {
    dir: {
      input: "site",
      output: "site/output",
    },
  };
};
