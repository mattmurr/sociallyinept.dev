function handler(event) {
  var req = event.request;
  var uri = req.uri;

  if (uri.endsWith("/")) req.uri += "index.html";
  else if (!uri.includes(".")) req.uri += "/index.html";

  return req;
}
