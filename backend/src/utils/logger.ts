export default class Logger {
  static log(level: string, message: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  static debug(message: any) {
    this.log("debug", message);
  }

  static info(message: any) {
    this.log("info", message);
  }

  static warn(message: any) {
    this.log("warn", message);
  }

  static error(message: any) {
    this.log("error", message);
  }
}
