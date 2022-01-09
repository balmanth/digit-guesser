import { Matrix } from '../core/matrix';
import { NeuralFunction } from './function';
import { NeuralMath } from './math';

/**
 * Neural layer class.
 */
export class NeuralLayer {
  /**
   * Number of input neurons.
   */
  #input: number;

  /**
   * Number of output neurons.
   */
  #output: number;

  /**
   * Activation function.
   */
  #activation: NeuralFunction;

  /**
   * Layer weight.
   */
  #weight: Matrix;

  /**
   * Layer bias.
   */
  #bias: Matrix;

  /**
   * Default constructor.
   * @param input Input neurons.
   * @param output Output neurons.
   * @param activation Activation function.
   */
  constructor(input: number, output: number, activation: NeuralFunction) {
    this.#input = Math.trunc(input);
    this.#output = Math.trunc(output);
    this.#activation = activation;
    this.#weight = new Matrix(this.#input, this.#output, Float32Array);
    this.#bias = new Matrix(this.#input, 1, Float32Array);
  }

  /**
   * Process the given input matrix.
   * @param input Input matrix.
   * @returns Returns a new matrix containing the results.
   */
  process(input: Matrix): Matrix {
    return this.#weight
      .multiply(input)
      .add(this.#bias)
      .map((value) => this.#activation.generate(value));
  }

  /**
   * Get the number of input neurons.
   */
  get input(): number {
    return this.#input;
  }

  /**
   * Get the number of output neurons.
   */
  get output(): number {
    return this.#output;
  }

  /**
   * Get the layer weight.
   */
  get weight(): Matrix {
    return this.#weight;
  }

  /**
   * Get the layer bias.
   */
  get bias(): Matrix {
    return this.#bias;
  }

  /**
   * Performs a crossover between the specified weights and set the result in the given target.
   * @param target Target weight.
   * @param source1 First weight.
   * @param source2 Second weight.
   */
  static #crossWeight(target: Matrix, source1: Matrix, source2: Matrix): void {
    const size = target.size;
    const half = Math.trunc(size / 2);
    for (let offset1 = 0, offset2 = size - 1; offset1 <= half; ++offset1, --offset2) {
      const row1 = Matrix.getRow(source1, offset1);
      const row2 = Matrix.getRow(source2, offset2);
      const column1 = Matrix.getColumn(source1, offset1);
      const column2 = Matrix.getColumn(source2, offset2);
      const value1 = source1.get(row1, column1);
      const value2 = source2.get(row2, column2);
      target.set(row1, column1, value2);
      target.set(row2, column2, value1);
    }
  }

  /**
   * Mutate the given weight randomly.
   * @param weight Target weight.
   * @param min Min mutation value.
   * @param max Max mutation value.
   * @param rate Mutation rate.
   */
  static #mutateWeight(weight: Matrix, min: number, max: number, rate: number): void {
    const size = Math.round(weight.size * rate);
    const indexes = NeuralMath.randomSet(0, weight.size - 1, size);
    for (const index of indexes) {
      const row = Matrix.getRow(weight, index);
      const column = Matrix.getColumn(weight, index);
      const random = NeuralMath.random(min, max);
      const current = weight.get(row, column);
      weight.set(row, column, current + random);
    }
  }

  /**
   * Performs a crossover between the specified bias and set the result in the given target.
   * @param target Target bias.
   * @param source1 First bias.
   * @param source2 Second bias.
   */
  static #crossBias(target: Matrix, source1: Matrix, source2: Matrix): void {
    const size = target.size;
    const half = Math.trunc(size / 2);
    for (let row1 = 0, row2 = size - 1; row1 < half; ++row1, --row2) {
      const value1 = source1.get(row1, 0);
      const value2 = source2.get(row2, 0);
      target.set(row1, 0, value2);
      target.set(row2, 0, value1);
    }
  }

  /**
   * Mutate the given bias randomly.
   * @param target Target bias.
   * @param min Min mutation value.
   * @param max Max mutation value.
   * @param rate Mutation rate.
   */
  static #mutateBias(target: Matrix, min: number, max: number, rate: number): void {
    const size = Math.round(target.size * rate);
    const indexes = NeuralMath.randomSet(0, target.size - 1, size);
    for (const index of indexes) {
      const random = NeuralMath.random(min, max);
      const current = target.get(index, 0);
      target.set(index, 0, current + random);
    }
  }

  /**
   * Create a new layer based on crossover of the given layers.
   * @param layer1 Input layer 1.
   * @param layer2 Input layer 2.
   * @returns Returns the generated layer.
   */
  static fromCrossover(layer1: NeuralLayer, layer2: NeuralLayer): NeuralLayer {
    const result = new NeuralLayer(layer1.#input, layer1.#output, layer1.#activation);
    this.#crossBias(result.bias, layer1.bias, layer2.bias);
    this.#crossWeight(result.weight, layer1.weight, layer2.weight);
    return result;
  }

  /**
   * Randomize the bias and weights for the given layer.
   * @param layer Input layer.
   * @param min Min random value.
   * @param max Max random value.
   */
  static randomize(layer: NeuralLayer, min: number, max: number): void {
    layer.#bias.fill(() => NeuralMath.random(min, max));
    layer.#weight.fill(() => NeuralMath.random(min, max));
  }

  /**
   * Mutate the bias and weights for the given layer.
   * @param layer Input layer.
   * @param min Min mutation value.
   * @param max Max mutation value.
   * @param rate Mutation rate.
   */
  static mutate(layer: NeuralLayer, min: number, max: number, rate: number): void {
    this.#mutateWeight(layer.weight, min, max, rate);
    this.#mutateBias(layer.bias, min, max, rate);
  }

  /**
   * Adjust the bias and weights for the given layer.
   * @param layer Input layer.
   * @param weight Weight adjustments.
   * @param bias Bias adjustments.
   */
  static adjust(layer: NeuralLayer, weight: Matrix, bias: Matrix): void {
    layer.#weight = layer.#weight.add(weight);
    layer.#bias = layer.#bias.add(bias);
  }
}
