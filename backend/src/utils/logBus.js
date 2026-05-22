import { EventEmitter } from "events";

export const logBus = new EventEmitter();
logBus.setMaxListeners(20);

function serialize(args) {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a, null, 2);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  logBus.emit("log", serialize(args));
};

console.error = (...args) => {
  originalError(...args);
  logBus.emit("log", `[ERROR] ${serialize(args)}`);
};
