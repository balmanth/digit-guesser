import { NeuralNetwork } from '../neural/network';
import { NeuralSigmoidFunction } from '../neural/functions/sigmoid';
import { Worker } from '../core/worker';

export default null as any;

const activation = new NeuralSigmoidFunction();
const network = NeuralNetwork.fromRandom([225, 120, 60, 6], 0.1, activation);
const worker = new Worker(self);

/**
 * Register the worker train listener.
 */
worker.listen('train', (...values): void => {
  const [source, target] = values as [number[], number[]];
  for (let rounds = 0; rounds < 1000; ++rounds) {
    network.train(source, target);
  }
  console.log(network);
});

/**
 * Register the worker predict listener.
 */
worker.listen('predict', (...values): number[] => {
  const [inputs] = values as [number[]];
  const outputs = network.predict(inputs);
  return outputs;
});
