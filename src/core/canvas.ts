import { Matrix } from './matrix';

/**
 * Canvas wrapper class.
 */
export class Canvas {
  /**
   * Canvas context.
   */
  #context: CanvasRenderingContext2D;

  /**
   * Canvas height.
   */
  #height: number;

  /**
   * Canvas width.
   */
  #width: number;

  /**
   * Pixels matrix.
   */
  #pixels: Matrix;

  /**
   * Pixel height.
   */
  #pixelHeight: number;

  /**
   * Pixel width.
   */
  #pixelWidth: number;

  /**
   * Determines whether or not the user is drawing.
   */
  #drawing = false;

  /**
   * Get the context 2D for the given canvas element.
   * @param element Canvas element.
   * @returns Returns the 2D context.
   * @throws Throw an exception when the context can't be given.
   */
  static #getContext(element: HTMLCanvasElement): CanvasRenderingContext2D {
    const context = element.getContext('2d');
    if (!context || !(context instanceof CanvasRenderingContext2D)) {
      throw `Unable to get the expected canvas context.`;
    }
    return context;
  }

  /**
   * Get the corresponding row for the given Y coordinate in the canvas element.
   * @param y Y coordinate.
   * @returns Returns the corresponding row number.
   */
  #getPixelRow(y: number): number {
    return Math.floor(y / this.#pixelHeight);
  }

  /**
   * Get the corresponding column for the given X coordinate in the canvas element.
   * @param x X coordinate.
   * @returns Returns the corresponding column number.
   */
  #getPixelColumn(x: number): number {
    return Math.floor(x / this.#pixelWidth);
  }

  /**
   * Handle the mouse click event in the canvas element.
   * @param event Mouse click event.
   */
  #handleClick(event: MouseEvent): void {
    if (!this.#drawing) {
      const row = this.#getPixelRow(event.offsetY);
      const column = this.#getPixelColumn(event.offsetX);
      const value = this.#pixels.get(row, column) === 0 ? 1 : 0;
      this.#pixels.set(row, column, value);
    }
    this.#drawing = false;
  }

  /**
   * Handle the mouse move event in the canvas element.
   * @param event Mouse move event.
   */
  #handleMove(event: MouseEvent): void {
    if (event.buttons === 1) {
      const row = this.#getPixelRow(event.offsetY);
      const column = this.#getPixelColumn(event.offsetX);
      this.#pixels.set(row, column, 1);
      this.#drawing = true;
    }
  }

  /**
   * Default constructor.
   * @param element Canvas element.
   * @param pixels Number of pixels.
   */
  constructor(element: HTMLCanvasElement, pixels: number) {
    this.#context = Canvas.#getContext(element);
    this.#height = element.height;
    this.#width = element.width;
    this.#pixels = new Matrix(pixels, pixels);
    this.#pixelHeight = this.#height / pixels;
    this.#pixelWidth = this.#width / pixels;
    element.addEventListener('click', this.#handleClick.bind(this));
    element.addEventListener('mousemove', this.#handleMove.bind(this));
  }

  /**
   * Get the canvas height.
   */
  get height(): number {
    return this.#height;
  }

  /**
   * Get the canvas width.
   */
  get width(): number {
    return this.#width;
  }

  /**
   * Get a copy of the pixel matrix data.
   */
  get data(): number[] {
    return this.#pixels.data;
  }

  /**
   * Draw all pixels.
   */
  draw(): void {
    this.#context.lineWidth = 1;
    this.#context.strokeStyle = '#000';
    this.#context.clearRect(0, 0, this.#width, this.#height);
    this.#context.strokeRect(1, 1, this.width - 2, this.height - 2);
    this.#pixels.each((value, row, col) => {
      const y = this.#pixelWidth * row;
      const x = this.#pixelHeight * col;
      this.#context.fillStyle = value > 0 ? '#000' : '#fff';
      this.#context.fillRect(x, y, this.#pixelWidth, this.#pixelHeight);
      this.#context.strokeRect(x, y, this.#pixelWidth, this.#pixelHeight);
    });
  }

  /**
   * Clear all pixels.
   */
  clear(): void {
    this.#pixels.fill(0);
    this.draw();
  }
}
