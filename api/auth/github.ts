export const config = {
  runtime: "edge",
  regions: ["lhr1"],
};


// Redirect to GitHub auth
export default (req: Request) => {
  const AUTH_URL = "https://github.com/login/oauth/authorize";
  const REDIRECT_PATH = "/api/auth/callback/github";

  const CLIENT_ID_KEY = "GITHUB_CLIENT_ID";

  if (!process.env.hasOwnProperty(CLIENT_ID_KEY)) {
    throw new Error(
      "GITHUB_CLIENT_ID environment variable is required."
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${AUTH_URL}?client_id=${process.env[CLIENT_ID_KEY]}&redirect_uri=${process.env.URL}${REDIRECT_PATH}`,
    },
  });
};
