export const config = {
  runtime: "edge",
  regions: ["lhr1"],
};

const AUTH_URL = "https://github.com/login/oauth/authorize";
const REDIRECT_PATH = "/api/auth/callback/github";
const CLIENT_ID_KEY = "GITHUB_CLIENT_ID";
const CLIENT_SECRET_KEY = "GITHUB_CLIENT_SECRET";

if (!process.env[CLIENT_ID_KEY] || !process.env[CLIENT_SECRET_KEY]) {
  throw new Error(
    "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables are required."
  );
}

// Redirect to GitHub auth
export default (req: Request) => {
  return {
    statusCode: 302,
    headers: {
      Location: `${AUTH_URL}?client_id=${process.env[CLIENT_ID_KEY]}&redirect_uri=${process.env.URL}${REDIRECT_PATH}`,
    },
  };
};
