const getEnv = require("../../utils.js").getEnv

module.exports = function() {
  return {
    title: getEnv("SITE_TITLE"),
    url: getEnv("SITE_URL"),
    desc: getEnv("SITE_DESCRIPTION"),
    author: getEnv("SITE_AUTHOR"),
    social: {
      email: getEnv("SITE_CONTACT_EMAIL"),
      social: getEnv("SITE_SOCIAL"),
      github: getEnv("SITE_GITHUB"),
    }
  }
}
