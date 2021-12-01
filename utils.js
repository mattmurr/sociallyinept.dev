const getEnv = (key) => {
  const val = process.env[key]
  if (!val) {
    console.error(`The ${key} environment variable is required but not set or empty.`)
    process.exit(1)
  }
  return val
}

module.exports = {
  getEnv
}
