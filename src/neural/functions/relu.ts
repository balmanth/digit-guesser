import { NeuralFunction } from '../function';

/**
 * Neural ReLU function class.
 */
export class NeuralReLUFunction extends NeuralFunction {
  /**
   * Scale constant.
   */
  #scale: number;

  /**
   * Default constructor.
   * @param scale Scale constant.
   */
  constructor(scale: number = 0.1) {
    super();
    this.#scale = scale;
  }

  /**
   * Get the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  generate(value: number): number {
    return value < 0 ? 0 : value * this.#scale;
  }

  /**
   * Get the derivative of the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  derivative(value: number): number {
    return value > 0 ? this.#scale : 0;
  }
}

/**
 * Neural Leaky ReLU function class.
 */
export class NeuralLeakyReLUFunction extends NeuralFunction {
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
    return (value < 0 ? value * this.#alpha : value) * this.#scale;
  }

  /**
   * Get the derivative of the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  derivative(value: number): number {
    return (value > 0 ? 1 : this.#alpha) * this.#scale;
  }
}
