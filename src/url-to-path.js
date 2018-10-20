/* eslint-disable require-jsdoc */
import parse from 'url-parse';
const re = /^(\/[\w-_]+)?\/docs\/web\//i;
import debug from 'debug';
const logger = (name) => debug(`url-to-path:${name}`);
// debug.enable('url-to-path:*');

export function preprocess(url, ) {
  const log = logger('preprocess');
  let {pathname, hostname} = parse(url);
  log(pathname, hostname);
  const invalid = hostname !== 'developer.mozilla.org' || !(re.test(pathname));
  const reject = () => Error(`Invalid url ${url}`);
  if (invalid) reject();
  const components = (String(pathname) || '')
    .replace(re, '')
    .split('/');
  log({components});
  if (components.length < 2) reject();
  const last = components.pop();
  return [
    ...(components.map((str) => str.toLowerCase())),
    last,
  ];
}
const ml = new Set(['svg', 'html', 'mathml']);
const topLevel = new Set([
  ...ml, 'api', 'browsers', 'css', 'http', 'javascript',
  'webdriver', 'webextensions',
]);


export function urlToPath(url) {
  const log = logger('main');
  const webPath = preprocess(url);
  log({webPath});
  const [section, subsection, last] = webPath;
  if (!topLevel.has(section)) {
    console.warn(`${section} is not a section of mdn-browser-compat-data`);
  }
  if (ml.has(section)) return `${section}/${subsection}s/${last}`;
  return webPath.join('/');
}
