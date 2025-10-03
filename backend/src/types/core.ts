import Application from "koa";

export type HttpResult<T> = success<T> | failure;

type success<T> = T;

type failure = {
  error: string;
  status: number;
};

export const Success = <T>(data: T): success<T> => data;

export const Failure = (error: string, status: number): failure => ({
  error,
  status: status,
});

export interface Mountable {
  mount(app: Application): void;
}
