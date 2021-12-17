type Error404 = { statusCode: 404 };
export const is404Error = (error: any): error is Error404 =>
  error.statusCode === 404;

type ErrorNoSuchKey = { code: "NoSuchKey" };
export const isNoSuchKeyError = (error: any): error is ErrorNoSuchKey =>
  error.code === "NoSuchKey";

type ErrorNoSuchBucket = { code: "NoSuchBucket" };
export const isNoSuchBucketError = (error: any): error is ErrorNoSuchBucket =>
  error.code === "NoSuchBucket";
