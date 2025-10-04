import Application from "koa";

// Success/Failure Response Pattern
export type Success<T> = T;

export type Failure = {
  error: string;
  code?: string;
  details?: any;
};

export type Result<T> = Success<T> | Failure;

// Utility functions for creating responses
export const success = <T>(data: T): Success<T> => data;

export const failure = (
  error: string,
  code?: string,
  details?: any
): Failure => ({
  error,
  code,
  details,
});

export interface Mountable {
  mount(app: Application): void;
}
