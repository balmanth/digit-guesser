/**
 * All matrix array types.
 */
export type MatrixArrayTypes =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

/**
 * Matrix type constructor.
 */
export type MatrixConstructor = new (size: number) => MatrixArrayTypes;

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
   * Matrix type.
   */
  #type: MatrixConstructor;

  /**
   * Array of data.
   */
  #data: MatrixArrayTypes;

  /**
   * Assert the given offset is within the matrix bounds.
   * @param offset Input offset.
   * @returns Returns the given offset.
   * @throws Throws an exception when the given offset is out of bounds.
   */
  #assertOffset(offset: number): number {
    if (offset >= this.#data.length) {
      throw `Matrix offset ${offset} is out of bounds (${this.#data.length}).`;
    }
    return offset;
  }

  /**
   * Default constructor.
   * @param rows Number of rows.
   * @param columns Number of columns.
   * @param type Matrix type.
   */
  constructor(rows: number, columns: number, type: MatrixConstructor = Float32Array) {
    this.#rows = Math.trunc(rows);
    this.#columns = Math.trunc(columns);
    this.#data = new type(this.#rows * this.#columns);
    this.#type = type;
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
    return this.#data[this.#assertOffset(offset)];
  }

  /**
   * Set the specified value to the given row and column.
   * @param row Value row.
   * @param column Value column.
   * @param value New value.
   * @throws Throws an exception when the given row and/or column overflows the matrix size.
   * @returns Returns the previous value.
   */
  set(row: number, column: number, value: number): number {
    const offset = this.#assertOffset(Matrix.getOffset(this, row, column));
    const previous = this.#data[offset];
    this.#data[offset] = value;
    return previous;
  }

  /**
   * Change all matrix values.
   * @param value New value or callback.
   */
  fill(value: number | ((row: number, column: number, value: number) => number)): void {
    if (!(value instanceof Function)) {
      this.#data.fill(value);
    } else {
      for (let row = 0; row < this.#rows; ++row) {
        for (let column = 0; column < this.#columns; ++column) {
          const offset = Matrix.getOffset(this, row, column);
          this.#data[offset] = value(row, column, this.#data[offset]);
        }
      }
    }
  }

  /**
   * Performs an action for each matrix value.
   * @param callback Callback to be performed.
   */
  each(callback: (value: number, row: number, column: number) => void): void {
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
  map(callback: (value: number, row: number, column: number) => number): Matrix {
    const result = new Matrix(this.#rows, this.#columns, this.#type);
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
      throw `Unable to multiply the given matrices (${this.#columns}x${matrix.#rows}).`;
    }
    const result = new Matrix(this.#rows, matrix.#columns, this.#type);
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
    const result = new Matrix(this.#columns, this.#rows, this.#type);
    result.fill((row, column) => this.at(column, row)!);
    return result;
  }

  slice(row: number, column: number, size: number): Matrix {
    const result = new Matrix(size, size, this.#type);
    result.fill((subRow, subColumn) => this.at(row + subRow, column + subColumn)!);
    return result;
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
   * Get the matrix type.
   */
  get type(): MatrixConstructor {
    return this.#type;
  }

  /**
   * Get a copy of the matrix data.
   */
  get data(): number[] {
    return [...this.#data];
  }

  /**
   * Get a new matrix for the given array.
   * @param array Input array.
   * @param columns Optional number of columns.
   * @param type Optional matrix type.
   * @returns Returns the new matrix.
   */
  static fromArray(
    array: MatrixArrayTypes | number[],
    columns: number = 1,
    type: MatrixConstructor = Float32Array
  ): Matrix {
    const result = new Matrix(array.length / columns, columns, type);
    if (!(array instanceof type)) {
      result.fill((row, column) => array[this.getOffset(result, row, column)]);
    } else {
      result.#data.set(array);
    }
    return result;
  }

  /**
   * Get the corresponding offset for the given row and column.
   * @param row Input row.
   * @param column Input column.
   * @returns Returns the corresponding offset.
   */
  static getOffset(matrix: Matrix, row: number, column: number): number {
    return Math.trunc(row) * matrix.columns + Math.trunc(column);
  }

  /**
   * Get the corresponding row for the given offset.
   * @param offset Input offset.
   * @returns Returns the corresponding row.
   */
  static getRow(matrix: Matrix, offset: number): number {
    return Math.trunc(offset / matrix.#columns);
  }

  /**
   * Get the corresponding column for the given offset.
   * @param offset Input offset.
   * @returns Returns the corresponding column.
   */
  static getColumn(matrix: Matrix, offset: number): number {
    return offset - this.getRow(matrix, offset) * matrix.#columns;
  }
}
