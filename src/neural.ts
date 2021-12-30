import { Matrix } from './core/matrix';

/**
 * Neural layer class.
 */
export class NeuralLayer {
  /**
   * Layer biases.
   */
  #biases: Matrix;

  /**
   * Layer weights.
   */
  #weights: Matrix;

  /**
   * Randomize the given matrix with values between -1.0 and 1.0.
   * @param matrix Input matrix.
   */
  static #randomize(matrix: Matrix): void {
    matrix.fill(() => Math.random() * 2 - 1);
  }

  /**
   * Apply the sigmoid function to the given value.
   * @param value Input value.
   * @returns Returns the resulting value.
   */
  static #sigmoid(value: number): number {
    return 1 / (1 + Math.exp(-value));
  }

  /**
   * Default constructor.
   * @param input Input neurons.
   * @param output Output neurons.
   */
  constructor(input: number, output: number) {
    this.#biases = new Matrix(input, 1);
    this.#weights = new Matrix(input, output);
    NeuralLayer.#randomize(this.#biases);
    NeuralLayer.#randomize(this.#weights);
  }

  /**
   * Get the layer biases.
   */
  get biases(): Matrix {
    return this.#biases;
  }

  /**
   * Get the layer weights.
   */
  get weights(): Matrix {
    return this.#weights;
  }

  /**
   * Adjust the layer biases and weights.
   * @param biases Bias adjustments.
   * @param weights Weight adjustments.
   */
  adjust(biases: Matrix, weights: Matrix): void {
    this.#biases = this.#biases.add(biases);
    this.#weights = this.#weights.add(weights);
  }

  /**
   * Process the given input matrix.
   * @param input Input matrix.
   * @returns Returns a new matrix containing the results.
   */
  process(input: Matrix): Matrix {
    return this.#weights.multiply(input).add(this.#biases).map(NeuralLayer.#sigmoid);
  }
}

/**
 * Neural network class.
 */
export class NeuralNetwork {
  /**
   * All hidden layers.
   */
  #hiddenLayers: NeuralLayer[] = [];

  /**
   * Learning rate.
   */
  #learningRate: number;

  /**
   * Initialize all the hidden layers.
   * @param layers Array containing the max number of neurons per layer.
   */
  #initialize(layers: number[]): void {
    let last;
    for (const neurons of layers) {
      if (last !== void 0) {
        const layer = new NeuralLayer(neurons, last);
        this.#hiddenLayers.push(layer);
      }
      last = neurons;
    }
  }

  /**
   * Process all layers with the given input.
   * @param input Input values.
   * @returns Returns an array containing all the resulting matrices.
   */
  #processAll(input: number[]): Matrix[] {
    let result = Matrix.fromArray(input);
    const output = [result];
    for (const layer of this.#hiddenLayers) {
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
    return this.#scalarMultiply(
      this.#hadamardMultiply(
        input.map((value) => value * (1 - value)),
        errors
      ),
      this.#learningRate
    );
  }

  /**
   * Default constructor.
   * @param layers Array containing the max number of neurons per layer.
   * @param learningRate Learning rate constant.
   */
  constructor(layers: number[], learningRate: number = 0.1) {
    this.#learningRate = learningRate;
    this.#initialize(layers);
  }

  /**
   * Get all the hidden layers.
   */
  get hiddenLayers(): NeuralLayer[] {
    return this.#hiddenLayers;
  }

  /**
   * Get the learning rate.
   */
  get learningRate(): number {
    return this.#learningRate;
  }

  /**
   * Train the network to adjust its answer according to the given input and expected values.
   * @param input Input values.
   * @param expect Expected output values.
   */
  train(input: number[], expect: number[]): void {
    const output = this.#processAll(input);
    let errors = Matrix.fromArray(expect).subtract(output[output.length - 1]);
    for (let index = output.length - 1; index > 0; --index) {
      const layer = this.#hiddenLayers[index - 1];
      const biases = this.#gradientDescent(output[index], errors);
      const weights = biases.multiply(output[index - 1].transpose());
      layer.adjust(biases, weights);
      if (index > 1) {
        errors = layer.weights.transpose().multiply(errors);
      }
    }
  }

  /**
   * Predict the best answer for the given input.
   * @param input Input values.
   * @returns Returns the output values for the best answer.
   */
  predict(input: number[]): number[] {
    const output = this.#processAll(input);
    const offset = output.length - 1;
    return output[offset].data;
  }
}
