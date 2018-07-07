/* eslint-disable require-jsdoc */
import parse from 'url-parse';
const re = /^(\/[\w-_]+)?\/docs\/web\//i;

function preprocess(url) {
  let {pathname, hostname} = parse(url);
  const invalid = hostname !== 'developer.mozilla.org' || !(re.test(pathname));
  const reject = () => Error(`Invalid url ${url}`);
  if (invalid) reject();
  const components = (String(pathname) || '')
    .replace(prefix, '')
    .split('/');
  if (components.length < 2) reject();
  return [
    ...(components
      .slice(0, components.length - 2)
      .map((str) => str.toLowerCase())),
    components[components.length - 1],
  ];
}
const ml = new Set(['svg', 'html', 'mathml']);
const topLevel = new Set([
  ...ml, 'api', 'browsers', 'css', 'http', 'javascript',
  'webdriver', 'webextensions',
]);


export function urlToPath(url) {
  const webPath = preprocess(url);
  const [section, subsection, last] = webPath;
  if (!topLevel.has(section)) {
    console.warn(`${section} is not a section of mdn-browser-compat-data`);
  }
  if (ml.has(section)) return `${section}/${subsection}s/${last}`;
  return webPath.join('/');
}
