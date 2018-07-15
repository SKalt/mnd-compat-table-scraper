import {readFileSync as rfs} from 'fs';
const math = rfs(`${__dirname}/mathml-element-math.html`, 'utf8');
const atDoc = rfs(`${__dirname}/css-@document.html`, 'utf8');
const mouseEnter = rfs(`${__dirname}/events-mouseenter.html`, 'utf8');

export {
  math,
  atDoc,
  mouseEnter,
};
