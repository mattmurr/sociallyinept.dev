const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addFilter("postDate", (date) =>
    DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)
  );

  return {
    dir: {
      input: "site",
      output: "site/output",
    },
  };
};
