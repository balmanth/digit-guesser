import { NeuralNetwork } from '../neural';
import { Worker, WorkerValueTypes } from '../core/worker';

export default null as any;

const neural = new NeuralNetwork([225, 120, 60, 6]);
const worker = new Worker(self);

/**
 * Register the worker train listener.
 */
worker.listen('train', (...values: WorkerValueTypes[]) => {
  const [source, target] = values as [number[], number[]];
  for (let rounds = 0; rounds < 1000; ++rounds) {
    neural.train(source, target);
  }
  worker.emit('trained');
});

/**
 * Register the worker predict listener.
 */
worker.listen('predict', (...values: WorkerValueTypes[]) => {
  const [inputs] = values as [number[]];
  const outputs = neural.predict(inputs);
  worker.emit('predicted', [...outputs]);
});
