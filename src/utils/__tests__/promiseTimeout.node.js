/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */
import promiseTimeout from '../promiseTimeout.tsx';

test('test promiseTimeout for timeout to happen', () => {
  const promise = promiseTimeout(
    200,
    new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        resolve();
      }, 500);
      return 'Executed';
    }),
    'Timed out',
  );
  return expect(promise).rejects.toThrow('Timed out');
});

test('test promiseTimeout for timeout not to happen', () => {
  const promise = promiseTimeout(
    200,
    new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        resolve();
      }, 100);
      resolve('Executed');
    }),
    'Timed out',
  );
  return expect(promise).resolves.toBe('Executed');
});
