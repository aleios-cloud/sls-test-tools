type Error404 = { statusCode: 404 };
export const is404Error = (error: unknown): error is Error404 =>
  (error as { statusCode?: number }).statusCode === 404;

type ErrorNoSuchKey = { code: "NoSuchKey" };
export const isNoSuchKeyError = (error: unknown): error is ErrorNoSuchKey =>
  (error as { code?: string }).code === "NoSuchKey";

type ErrorNoSuchBucket = { code: "NoSuchBucket" };
export const isNoSuchBucketError = (
  error: unknown
): error is ErrorNoSuchBucket =>
  (error as { code?: string }).code === "NoSuchBucket";
