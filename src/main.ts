import { getAllElements, getElement } from './core/elements';
import { Worker, WorkerValueTypes } from './core/worker';
import { Canvas } from './core/canvas';

import NeuralWorker from './workers/neural.worker';

const worker = new Worker(new NeuralWorker());
const canvas = new Canvas(getElement<HTMLCanvasElement>('.canvas'), 15);
const counters = [0, 0, 0, 0, 0, 0];

const predictButton = getElement<HTMLButtonElement>('.predict');
const trainButton = getElement<HTMLButtonElement>('.train');
const clearButton = getElement<HTMLButtonElement>('.clear');
const inputElements = getAllElements<HTMLInputElement>('.input');
const counterElements = getAllElements<HTMLSpanElement>('.counter');
const outputElements = getAllElements<HTMLOutputElement>('.output');
const answerOutput = getElement<HTMLOutputElement>('.answer');

/**
 * Update all counting elements in the UI.
 */
const updateCounters = (): void => {
  counterElements.forEach((element, index) => {
    element.innerText = `${counters[index]}x`;
  });
};

/**
 * Update all output elements in the UI.
 * @param output Current outputs.
 */
const updateOutputs = (output: number[]): void => {
  output.forEach((value, index) => {
    const element = outputElements[index];
    element.value = value.toFixed(3);
    element.classList.remove('high', 'medium', 'low');
    if (value > 0.7) {
      element.classList.add('high');
    } else if (value > 0.4) {
      element.classList.add('medium');
    } else {
      element.classList.add('low');
    }
  });
};

/**
 * Update the answer element in the UI.
 * @param output Current outputs.
 */
const updateAnswer = (output: number[]): void => {
  const higher = Math.max(...output);
  if (higher > 0.4) {
    const index = output.indexOf(higher);
    inputElements[index].checked = true;
    answerOutput.value = `The best answer is: ${index}`;
  } else {
    inputElements.forEach((input) => (input.checked = false));
    answerOutput.value = `There's no best answer`;
  }
};

/**
 * Register the predict action button.
 */
predictButton.addEventListener('click', () => {
  console.log('Predicting...');
  worker.emit('predict', canvas.data);
});

/**
 * Register the train action button.
 */
trainButton.addEventListener('click', () => {
  console.log('Training...');
  const expected = inputElements.map((input, index) => {
    if (input.checked) {
      counters[index]++;
      return 1;
    }
    return 0;
  });
  worker.emit('train', canvas.data, expected);
});

/**
 * Register the clear action button.
 */
clearButton.addEventListener('click', () => {
  canvas.clear();
});

/**
 * Register the trained worker listener.
 */
worker.listen('trained', () => {
  updateCounters();
  console.log('Done!');
});

/**
 * Register the predicted worker listener.
 */
worker.listen('predicted', (...values: WorkerValueTypes[]) => {
  const [outputs] = values as [number[]];
  updateAnswer(outputs);
  updateOutputs(outputs);
  console.log('Done!');
});

/**
 * Start to update the canvas element with the current drawing in the UI.
 */
(function updateCanvas(): void {
  canvas.draw();
  window.requestAnimationFrame(updateCanvas);
})();
