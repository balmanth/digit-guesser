import { NeuralFunction } from '../function';

/**
 * Neural Linear function class.
 */
export class NeuralLinearFunction extends NeuralFunction {
  /**
   * Scale constant.
   */
  #scale: number;

  /**
   * Default constructor.
   * @param scale Scale constant.
   */
  constructor(scale: number) {
    super();
    this.#scale = scale;
  }

  /**
   * Get the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  generate(value: number): number {
    return value * this.#scale;
  }

  /**
   * Get the derivative of the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  derivative(value: number): number {
    return this.#scale;
  }
}
