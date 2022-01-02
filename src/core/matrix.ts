/**
 * Matrix container.
 */
export class Matrix {
  /**
   * Number of rows.
   */
  #rows: number;

  /**
   * Number of columns.
   */
  #columns: number;

  /**
   * Array of data.
   */
  #data: Float32Array;

  /**
   * Get the corresponding offset for the given row and column.
   * @param row Input row.
   * @param column Input column.
   * @returns Returns the corresponding offset.
   */
  static getOffset(matrix: Matrix, row: number, column: number): number {
    return row * matrix.#columns + column;
  }

  /**
   * Get a new matrix from on the given array.
   * @param array Input array.
   * @returns Returns the new matrix.
   */
  static fromArray(array: number[]): Matrix {
    const result = new Matrix(array.length, 1);
    result.fill((row) => array[row]);
    return result;
  }

  /**
   * Default constructor.
   * @param rows Number of rows.
   * @param columns Number of columns.
   */
  constructor(rows: number, columns: number) {
    this.#rows = rows;
    this.#columns = columns;
    this.#data = new Float32Array(rows * columns);
  }

  /**
   * Get the number of rows.
   */
  get rows(): number {
    return this.#rows;
  }

  /**
   * Get the number of columns.
   */
  get columns(): number {
    return this.#columns;
  }

  /**
   * Get the matrix size.
   */
  get size(): number {
    return this.#rows * this.#columns;
  }

  /**
   * Get a copy of the matrix data.
   */
  get data(): number[] {
    return [...this.#data];
  }

  /**
   * Get the value that corresponds to the given row and column.
   * @param row Value row.
   * @param column Value column.
   * @returns Returns the corresponding value or undefined when the given row and/or column
   *          overflows the matrix size.
   */
  at(row: number, column: number): number | undefined {
    return this.#data[Matrix.getOffset(this, row, column)];
  }

  /**
   * Get the value that corresponds to the given row and column.
   * @param row Value row.
   * @param column Value column.
   * @returns Returns the corresponding value.
   * @throws Throws an exception when the given row and/or column overflows the matrix size.
   */
  get(row: number, column: number): number {
    const offset = Matrix.getOffset(this, row, column);
    if (offset > this.#data.length) {
      throw `Matrix offset overflow (${offset}).`;
    }
    return this.#data[offset];
  }

  /**
   * Set the specified value to the given row and column.
   * @param row Value row.
   * @param column Value column.
   * @param value New value.
   * @throws Throws an exception when the given row and/or column overflows the matrix size.
   */
  set(row: number, column: number, value: number): void {
    const offset = Matrix.getOffset(this, row, column);
    if (offset > this.#data.length) {
      throw `Matrix offset overflow (${offset}).`;
    }
    this.#data[offset] = value;
  }

  /**
   * Change all matrix values.
   * @param value New value or callback.
   */
  fill(value: number | ((row: number, column: number) => number)): void {
    if (!(value instanceof Function)) {
      this.#data.fill(value);
    } else {
      for (let row = 0; row < this.#rows; ++row) {
        for (let column = 0; column < this.#columns; ++column) {
          const offset = Matrix.getOffset(this, row, column);
          this.#data[offset] = value(row, column);
        }
      }
    }
  }

  /**
   * Performs an action for each matrix value.
   * @param callback Callback to be performed.
   */
  each(callback: (data: number, row: number, column: number) => void): void {
    for (let row = 0; row < this.#rows; ++row) {
      for (let column = 0; column < this.#columns; ++column) {
        callback(this.at(row, column)!, row, column);
      }
    }
  }

  /**
   * Map all matrix values.
   * @param callback Callback to be performed.
   * @returns Returns a new matrix containing the results.
   */
  map(callback: (data: number, row: number, column: number) => number): Matrix {
    const result = new Matrix(this.#rows, this.#columns);
    result.fill((row, column) => callback(this.at(row, column)!, row, column));
    return result;
  }

  /**
   * Add the given matrix.
   * @param matrix Input matrix.
   * @returns Returns a new matrix containing the results.
   */
  add(matrix: Matrix): Matrix {
    return this.map((value, row, column) => value + matrix.at(row, column)!);
  }

  /**
   * Subtract the given matrix.
   * @param matrix Input matrix.
   * @returns Returns a new matrix containing the results.
   */
  subtract(matrix: Matrix): Matrix {
    return this.map((value, row, column) => value - matrix.at(row, column)!);
  }

  /**
   * Multiply the matrix.
   * @param matrix Input matrix.
   * @returns Returns a new matrix containing the results.
   */
  multiply(matrix: Matrix): Matrix {
    if (this.#columns !== matrix.#rows) {
      throw `Unable to multiply the given matrices.`;
    }
    const result = new Matrix(this.#rows, matrix.#columns);
    result.fill((row, column) => {
      let sum = 0;
      for (let index = 0; index < this.#columns; ++index) {
        sum += this.at(row, index)! * matrix.at(index, column)!;
      }
      return sum;
    });
    return result;
  }

  /**
   * Transpose the matrix.
   * @returns Returns a new matrix containing the results.
   */
  transpose(): Matrix {
    const result = new Matrix(this.#columns, this.#rows);
    result.fill((row, column) => this.at(column, row)!);
    return result;
  }
}
