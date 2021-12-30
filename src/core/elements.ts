/**
 * Get all elements that corresponds to the given selector.
 * @param selector Element selector.
 * @returns Returns an array containing all elements.
 * @throws Throws an exception when there's no elements for the given selector.
 */
export const getAllElements = <K extends Element>(selector: string): K[] => {
  const elements = document.querySelectorAll<K>(selector);
  if (!elements || elements.length === 0) {
    throw `Unable to get any element by the given selector (${selector}).`;
  }
  return [...elements];
};

/**
 * Get the first element that corresponds to the given selector.
 * @param selector Element selector.
 * @returns Returns the corresponding element.
 */
export const getElement = <K extends Element>(selector: string): K => {
  return getAllElements<K>(selector)[0];
};
