import { Middleware } from "koa";
import { ZodError } from "zod";

export function errorHandler(): Middleware {
  return async (ctx, next) => {
    try {
      await next();
      const response = await ctx.response.body;
      if (response && typeof response === "object" && "error" in response) {
        ctx.status = 500;
        ctx.body = { error: response.error };
      }
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        ctx.status = 400;
        ctx.body = {
          error: "Validation failed",
          details: JSON.parse(error.message),
        };
      } else {
        ctx.status = 500;
        ctx.body = { error: "Internal server error" };
      }
    }
  };
}
