import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { container } from "./config/container";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logging";
import { Mountable } from "./types/core";
import { TYPES } from "./types/di";

const app = new Koa();

app.use(requestLogger());
app.use(errorHandler());
app.use(bodyParser());

app.use(
  cors({
    origin: "*",
  })
);

app.use(async (ctx, next) => {
  if (ctx.method === "GET" && ctx.path === `/api/health`) {
    ctx.status = 200;
    ctx.response.body = {
      message: "ok",
      timestamp: new Date().toISOString(),
    };
    return;
  }
  await next();
});

const routers = container.getAll<Mountable>(TYPES.ApiRouter);

for (const router of routers) {
  router.mount(app);
}

export default app;
