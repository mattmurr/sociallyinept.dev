export const config = {
  runtime: "edge",
  regions: ["lhr1"],
};

// Redirect to GitHub auth
export default (req: Request) => {
  const AUTH_URL = "https://github.com/login/oauth/authorize";

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${AUTH_URL}?client_id=${process.env.GITHUB_CLIENT_ID}`,
    },
  });
};
