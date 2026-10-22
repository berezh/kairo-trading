import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let workerStartPromise: ReturnType<typeof worker.start> | undefined;

export function startMocking() {
  if (!workerStartPromise) {
    workerStartPromise = worker.start({ onUnhandledFrame: "bypass" }).catch((error: unknown) => {
      workerStartPromise = undefined;
      throw error;
    });
  }

  return workerStartPromise;
}
