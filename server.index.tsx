import "./service.application";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { useRouter } from "./server.router";
import { browserRun } from "./service.browser";

const app = new Hono({
  strict: true,
});

app.use(logger());
useRouter(app);

browserRun();

const tls = {
  key: Bun.file("./cert/localhost+2-key.pem"),
  cert: Bun.file("./cert/localhost+2.pem"),
};

export default {
  port: 6969,
  fetch: app.fetch,
  tls,
};
