/**
 * Neural math class.
 */
 export class NeuralMath {
  /**
   * Get a random number between the min and max values.
   * @param min Min value.
   * @param max Max value.
   * @returns Returns the random number.
   */
  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Get a new set of random integers between the min and max values.
   * @param min Min integer value.
   * @param max Max integer value.
   * @param size Size of the set.
   * @returns Returns an array containing all the random numbers.
   */
  static randomSet(min: number, max: number, size: number): number[] {
    const values = new Set<number>();
    do {
      const number = this.random(min, max);
      values.add(Math.trunc(number));
    } while (values.size < size);
    return [...values];
  }
}
