import Logger from "./logger";

export default class Errors {
  static createError(errMessage: string, err?: any) {
    const error = {
      err_message: errMessage,
      error: err?.message ?? err,
    };
    Logger.error(JSON.stringify(error));
    return error;
  }
}
