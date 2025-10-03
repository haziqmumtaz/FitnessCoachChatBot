import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { requestLogger } from "./middlewares/logging";
import { errorHandler } from "./middlewares/errorHandler";
import { TYPES } from "./types/di";
import { container } from "./config/container";
import { Mountable } from "./types/core";

const app = new Koa();

app.use(requestLogger());
app.use(errorHandler());
app.use(bodyParser());
app.use(cors());

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
