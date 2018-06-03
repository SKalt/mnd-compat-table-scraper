/**
 * A port of python's `zip()`.
 * The returned generator yeilds arrays, where the i-th array contains the i-th
 * element from each of the passed iterables.
 * @param  {Iterable[]}    toZip iterables to zip together.
 * @return {Generator}
 */
export function* zip(...toZip) {
  const iterators = toZip.map((arg) => arg[Symbol.iterator]());
  const next = () => toZip = iterators.map((iter) => iter.next());
  while (next().every((item) => !item.done)) {
    yield toZip.map((item) => item.value);
  }
}
