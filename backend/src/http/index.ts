import { injectable } from "inversify";
import Router from "@koa/router";
import Koa from "koa";
import { createChatRouter } from "./chat.http";
import { Mountable } from "../types/core";

@injectable()
export class ApiRouter implements Mountable {
  private readonly router = new Router();

  constructor() {
    for (const createRouter of [createChatRouter]) {
      const router = createRouter();

      this.router.use(router.routes());
      this.router.use(router.allowedMethods());
    }
  }

  mount(app: Koa) {
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
  }
}
