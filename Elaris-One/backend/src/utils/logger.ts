type LogLevel = "info" | "warn" | "error" | "debug";

const colors: Record<LogLevel, string> = {
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[35m", // magenta
};

const RESET = "\x1b[0m";

function timestamp(): string {
  return new Date().toISOString();
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  const color = colors[level];
  const prefix = `${color}[${timestamp()}] [${level.toUpperCase()}]${RESET}`;

  const consoleMethod = level === "debug" ? "log" : level;

  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[consoleMethod](prefix, message, meta);
  } else {
    // eslint-disable-next-line no-console
    console[consoleMethod](prefix, message);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta),
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      write("debug", message, meta);
    }
  },
};

export default logger;
