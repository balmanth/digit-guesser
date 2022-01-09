import { NeuralFunction } from '../function';

/**
 * Neural Sigmoid function class.
 */
export class NeuralSigmoidFunction extends NeuralFunction {
  /**
   * Get the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  generate(value: number): number {
    return 1 / (1 + Math.exp(-value));
  }

  /**
   * Get the derivative of the function value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  derivative(value: number): number {
    return value * (1 - value);
  }
}
