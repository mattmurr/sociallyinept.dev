export const config = {
  runtime: "edge",
  regions: ["lhr1"],
};

export default (req: Request) => {
  return new Response(`Hello, from ${req.url} I'm now an Edge Function!`);
};
