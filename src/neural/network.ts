import { Matrix, MatrixArrayTypes } from '../core/matrix';
import { NeuralLayer } from './layer';
import { NeuralMath } from './math';

/**
 * All neural input types.
 */
export type NeuralInputTypes = MatrixArrayTypes | number[];

/**
 * Neural network class.
 */
export class NeuralNetwork {
  /**
   * All layers.
   */
  #layers: NeuralLayer[] = [];

  /**
   * Learning rate.
   */
  #rate: number;

  /**
   * Initialize all the layers.
   * @param layers Array containing the max number of neurons per layer.
   */
  #initialize(layers: number[]): void {
    let last;
    for (const neurons of layers) {
      if (last !== void 0) {
        const layer = new NeuralLayer(neurons, last);
        this.#layers.push(layer);
      }
      last = neurons;
    }
  }

  /**
   * Process all layers with the given input.
   * @param input Input values.
   * @returns Returns an array containing all the resulting matrices.
   */
  #processAll(input: NeuralInputTypes): Matrix[] {
    let result = Matrix.fromArray(input);
    const output = [result];
    for (const layer of this.#layers) {
      result = layer.process(result);
      output.push(result);
    }
    return output;
  }

  /**
   * Multiply the first matrix by the second one using the hadamard multiplication.
   * @param first First matrix.
   * @param second Second matrix.
   * @returns Returns a new matrix containing the results.
   */
  #hadamardMultiply(first: Matrix, second: Matrix): Matrix {
    return first.map((value, row, column) => value * second.at(row, column)!);
  }

  /**
   * Multiply the given matrix using the scalar value.
   * @param input Input matrix.
   * @param value Scalar value.
   * @returns Returns a new matrix containing the results.
   */
  #scalarMultiply(input: Matrix, value: number): Matrix {
    return input.map((current) => current * value);
  }

  /**
   * Calculate the gradient descent for the given input and errors.
   * @param input Input matrix.
   * @param errors Errors matrix.
   * @returns Returns a new matrix containing the results.
   */
  #gradientDescent(input: Matrix, errors: Matrix): Matrix {
    return this.#scalarMultiply(this.#hadamardMultiply(input.map(NeuralMath.deltaSigmoid), errors), this.#rate);
  }

  /**
   * Default constructor.
   * @param layers Array containing the max number of neurons per layer.
   * @param rate Learning rate.
   */
  constructor(layers: number[], rate: number = 0.1) {
    this.#initialize(layers);
    this.#rate = rate;
  }

  /**
   * Train the network to adjust its answer according to the given input and the expected values.
   * @param input Input values.
   * @param expect Expected output values.
   */
  train(input: number[], expect: number[]): void {
    const output = this.#processAll(input);
    let errors = Matrix.fromArray(expect).subtract(output[output.length - 1]);
    for (let index = output.length - 1; index > 0; --index) {
      const layer = this.#layers[index - 1];
      const bias = this.#gradientDescent(output[index], errors);
      const weight = bias.multiply(output[index - 1].transpose());
      NeuralLayer.adjust(layer, weight, bias);
      if (index > 1) {
        errors = layer.weight.transpose().multiply(errors);
      }
    }
  }

  /**
   * Predict the best answer for the given input.
   * @param input Input values.
   * @returns Returns the output values for the best answer.
   */
  predict(input: NeuralInputTypes): number[] {
    const output = this.#processAll(input);
    const offset = output.length - 1;
    return output[offset].data;
  }

  /**
   * Get the learning rate.
   */
  get rate(): number {
    return this.#rate;
  }

  /**
   * Create a new neural network based on the crossover of the given networks.
   * @param network1 First network.
   * @param network2 Second network.
   * @returns Returns the generated neural network.
   */
  static fromCrossover(network1: NeuralNetwork, network2: NeuralNetwork): NeuralNetwork {
    const result = new NeuralNetwork([], (network1.rate + network2.rate) / 2);
    const layers1 = network1.#layers;
    const layers2 = network2.#layers;
    for (let index = 0; index < layers1.length; ++index) {
      const layer = NeuralLayer.fromCrossover(layers1[index], layers2[index]);
      result.#layers.push(layer);
    }
    return result;
  }

  /**
   * Create a new neural network filled with random values.
   * @param layers Array containing the max number of neurons per layer.
   * @param rate Learning rate.
   * @returns Returns the generated neural network.
   */
  static fromRandom(layers: number[], rate: number = 0.1): NeuralNetwork {
    const result = new NeuralNetwork(layers, rate);
    for (const layer of result.#layers) {
      NeuralLayer.randomize(layer, -1, 1);
    }
    return result;
  }

  /**
   * Mutate all layers for the given neural network.
   * @param network Input network.
   * @param min Min mutation value.
   * @param max Max mutation value.
   * @param rate Mutation rate.
   */
  static mutate(network: NeuralNetwork, min: number, max: number, rate: number): void {
    for (const layer of network.#layers) {
      NeuralLayer.mutate(layer, min, max, rate);
    }
  }
}
