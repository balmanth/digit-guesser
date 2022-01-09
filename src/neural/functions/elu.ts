import { NeuralFunction } from '../function';

/**
 * Neural ELU function class.
 */
export class NeuralELUFunction extends NeuralFunction {
  /**
   * Alpha constant.
   */
  #alpha: number;

  /**
   * Scale constant.
   */
  #scale: number;

  /**
   * Default constructor.
   * @param alpha Alpha constant.
   * @param scale Scale constant.
   */
  constructor(alpha: number = 0.1, scale: number = 0.1) {
    super();
    this.#alpha = alpha;
    this.#scale = scale;
  }

  /**
   * Get the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  generate(value: number): number {
    return (value < 0 ? this.#alpha * Math.expm1(value) : value) * this.#scale;
  }

  /**
   * Get the derivative of the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  derivative(value: number): number {
    return (value > 0 ? 1 : this.#alpha * Math.exp(value)) * this.#scale;
  }
}
