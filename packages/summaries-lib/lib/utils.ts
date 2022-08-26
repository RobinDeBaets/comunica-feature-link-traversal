import { sha256 } from 'hash.js';

export type HashFunction = (input: string) => bigint;

export function getSha256Function(nonce: number): HashFunction {
  /**
     * We want a unique hash function for each nonce, a simply solution is to append the nonce as salt
     */
  return (input: string) => BigInt(`0x${sha256().update(`${input}${nonce}`).digest('hex')}`);
}

type Iterableify<T> = {[K in keyof T]: Iterable<T[K]> };

export function * product<T extends unknown[]>(...iterables: Iterableify<T>): Generator<T> {
  /**
     * Smart way to iterate the cartesian product of multiple iterators
     * Adapted from:
     * https://gist.github.com/cybercase/db7dde901d7070c98c48?permalink_comment_id=3718142#gistcomment-3718142
     */
  if (iterables.length === 0) {
    return;
  }
  const iterators = iterables.map(it => it[Symbol.iterator]());
  const results = iterators.map(it => it.next());

  // Cycle through iterators
  for (let i = 0; ;) {
    if (results[i].done) {
      // Reset the current iterator
      iterators[i] = iterables[i][Symbol.iterator]();
      results[i] = iterators[i].next();
      // Advance and exit if we've reached the end
      if (++i >= iterators.length) {
        return;
      }
    } else {
      yield <T>results.map(({ value }) => value);
      i = 0;
    }
    results[i] = iterators[i].next();
  }
}
