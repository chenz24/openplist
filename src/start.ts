import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { canonicalPathname } from "./lib/canonical-path";
import { renderErrorPage } from "./lib/error-page";
import { splitLocalePath } from "./lib/locales";

const canonicalUrlMiddleware = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  const path = canonicalPathname(url.pathname);
  if ((request.method === "GET" || request.method === "HEAD") && path !== url.pathname) {
    return new Response(null, { status: 308, headers: { Location: path + url.search } });
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ request, next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(splitLocalePath(new URL(request.url).pathname).locale), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware, canonicalUrlMiddleware],
}));
