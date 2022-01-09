/**
 * Allowed value types.
 */
type ValueTypes = boolean | number | bigint | string | ValueTypes[];

/**
 * Event callback type.
 */
type EventCallback = (...values: ValueTypes[]) => ValueTypes | void | Promise<ValueTypes | void>;

/**
 * Map of event listeners.
 */
type EventListenersMap = {
  [name: string]: EventCallback[];
};

/**
 * Map of event promises.
 */
type EventPromisesMap = {
  [id: number]: {
    /**
     * Resolve callback.
     */
    resolve: (values: ValueTypes[]) => void;
    /**
     * Reject callback.
     */
    reject: (values: string) => void;
  };
};

/**
 * Worker value types.
 */
export type WorkerValueTypes = ValueTypes;

/**
 * Worker event callback type.
 */
export type WorkerEventCallback = EventCallback;

/**
 * Worker wrapper class.
 */
export class Worker {
  /**
   * Counter for promises Ids.
   */
  static #promiseIds = 0;

  /**
   * Map of event promises.
   */
  static #eventPromises: EventPromisesMap = [];

  /**
   * Map of event listeners.
   */
  #eventListeners: EventListenersMap = {};

  /**
   * Window thread.
   */
  #thread: Window;

  /**
   * Assert the event name is not empty.
   * @param name Event name.
   */
  static #assertName(name: string): void {
    if (name.length === 0) {
      throw new Error(`Event name can't be empty.`);
    }
  }

  /**
   * Notify all the event listeners that corresponds to the given name.
   * @param id Event Id.
   * @param name Event name.
   * @param values Event values.
   */
  async #notifyListeners(id: number, name: string, ...values: ValueTypes[]): Promise<void> {
    const events = this.#eventListeners[name];
    if (events !== void 0) {
      try {
        let results = [];
        for (const callback of events) {
          const result = await callback(...values);
          if (result !== void 0) {
            results.push(result);
          }
        }
        this.#thread.postMessage([id, '', true, ...results]);
      } catch (error) {
        this.#thread.postMessage([id, '', false, `Worker: ${error}`]);
      }
    }
  }

  /**
   * Notify the event promise that corresponds to the given Id.
   * @param id Event Id.
   * @param values Event values.
   */
  #notifyPromises(id: number, ...values: ValueTypes[]): void {
    const promise = Worker.#eventPromises[id];
    if (promise !== void 0) {
      delete Worker.#eventPromises[id];
      const [status, ...results] = values;
      if (status) {
        promise.resolve(results);
      } else {
        promise.reject(results[0] as string);
      }
    }
  }

  /**
   * Handle all worker messages from the window thread.
   * @param event Message event.
   */
  #onMessage(event: MessageEvent<Array<ValueTypes>>) {
    if (event.data instanceof Array) {
      const [id, name, ...values] = event.data as [number, string, ...ValueTypes[]];
      if (name !== '') {
        this.#notifyListeners(id, name, ...values);
      } else {
        this.#notifyPromises(id, ...values);
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
   * @returns Returns a new promise for the getting the result.
   */
  async emit(name: string, ...values: ValueTypes[]): Promise<ValueTypes[]> {
    Worker.#assertName(name);
    return new Promise((resolve, reject) => {
      try {
        const id = Worker.#promiseIds++;
        Worker.#eventPromises[id] = { resolve, reject };
        this.#thread.postMessage([id, name, ...values]);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register a new event listener for the given name.
   * @param name Event name.
   * @param callback Listener callback.
   */
  listen(name: string, callback: EventCallback): void {
    Worker.#assertName(name);
    if (!(this.#eventListeners[name] instanceof Array)) {
      this.#eventListeners[name] = [];
    }
    this.#eventListeners[name].push(callback);
  }

  /**
   * Remove the event listener that corresponds to the given name and callback.
   * @param name Event name.
   * @param callback Listener callback.
   */
  unlisten(name: string, callback: EventCallback): void {
    Worker.#assertName(name);
    const events = this.#eventListeners[name];
    if (events instanceof Array) {
      const index = events.indexOf(callback);
      if (index !== -1) {
        events.splice(index, 1);
      }
    }
  }
}
