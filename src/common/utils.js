/**
 * A port of python's `zip()`.
 * The returned generator yeilds arrays, where the i-th array contains the i-th
 * element from each of the passed iterables.
 * @param  {Iterable[]}    toZip iterables to zip together.
 * @yield {any[]}
 */
export function* zip(...toZip) {
  const iterators = toZip.map((arg) => arg[Symbol.iterator]());
  const next = () => toZip = iterators.map((iter) => iter.next());
  while (next().every((item) => !item.done)) {
    yield toZip.map((item) => item.value);
  }
}
//
// export const ownText = (el) => [...el.childNodes]
//   .filter((node) => node.nodeType === 3)
//   .map((textNode) => textNode.textContent)
//   .join(' ')
//   .trim();
