export const config = {
  runtime: "edge",
  regions: ["lhr1"],
};

const AUTH_URL = "https://github.com/login/oauth/authorize";
const REDIRECT_PATH = "/api/auth/callback/github";
//const CLIENT_ID_KEY = "GITHUB_CLIENT_ID";
//const CLIENT_SECRET_KEY = "GITHUB_CLIENT_SECRET";

// Redirect to GitHub auth
export default (req: Request) => {
  //if (!process.env.hasOwnProperty("GITHUB_CLIENT_ID") || !process.env.hasOwnProperty("GITHUB_CLIENT_SECRET")) {
    //throw new Error(
      //"GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables are required."
    //);
  //}

  return {
    statusCode: 302,
    headers: {
      Location: `${AUTH_URL}?client_id=${process.env["GITHUB_CLIENT_ID"]}&redirect_uri=${process.env.URL}${REDIRECT_PATH}`,
    },
  };
};
