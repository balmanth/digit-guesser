/**
 * Neural function class.
 */
export abstract class NeuralFunction {
  /**
   * Get the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  generate(value: number): number {
    throw new Error(`Generate method isn't implemented yet.`);
  }

  /**
   * Get the derivative of the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  derivative(value: number): number {
    throw new Error(`Derivative method isn't implemented yet.`);
  }
}
