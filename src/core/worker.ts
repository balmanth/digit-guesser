/**
 * Allowed worker value types.
 */
export type WorkerValueTypes = boolean | number | bigint | string | WorkerValueTypes[];

/**
 * Worker event callback type.
 */
export type WorkerEventCallback = (...values: WorkerValueTypes[]) => void;

/**
 * Map of events.
 */
type EventMap = {
  [name: string]: WorkerEventCallback[];
};

/**
 * Worker wrapper class.
 */
export class Worker {
  /**
   * Worker events.
   */
  #events: EventMap = {};

  /**
   * Window thread.
   */
  #thread: Window;

  /**
   * Handle worker message events from the window thread.
   * @param event Message event.
   */
  #onMessage(event: MessageEvent<Array<WorkerValueTypes>>) {
    if (event.data instanceof Array) {
      const [name, ...values] = event.data as [string, ...WorkerValueTypes[]];
      const events = this.#events[name];
      if (events !== void 0) {
        for (const callback of events) {
          callback(...values);
        }
      }
    }
  }

  /**
   * Default constructor.
   * @param thread Window thread.
   */
  constructor(thread: Window) {
    this.#thread = thread;
    thread.addEventListener('message', this.#onMessage.bind(this));
  }

  /**
   * Emit a new event to the window thread.
   * @param name Event name.
   * @param values Event values.
   */
  emit(name: string, ...values: WorkerValueTypes[]): void {
    this.#thread.postMessage([name, ...values]);
  }

  /**
   * Register a new listener for events that corresponds to the given name.
   * @param name Event name.
   * @param callback Listener callback.
   */
  listen(name: string, callback: WorkerEventCallback) {
    if (!(this.#events[name] instanceof Array)) {
      this.#events[name] = [];
    }
    this.#events[name].push(callback);
  }
}
