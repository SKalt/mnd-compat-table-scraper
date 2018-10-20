/* eslint-env browser */
import {scrape, urlToPath} from './index.js';

// JSON schema validation
import Ajv from 'ajv';
import schema from 'mdn-browser-compat-data/schemas/compat-data.schema.json';
const ajv = new Ajv({allErrors: true});
ajv.addSchema(schema, 'main');

const path = urlToPath(window.location.href);
const gh = (p) => `https://github.com/mdn/browser-compat-data/blob/master/${p}`;
gh.raw = (p) => gh(p).replace('github', 'raw.githubusercontent');
const ping = async () => await fetch(gh.raw(path)).then((r) => r.ok);
ping.then((ok) => {
  const message = ok
    ? `this entry already exists at ${gh(path)}`
    : `this entry isn't yet in ${gh('').repalace('/blob/master')}`;
  console.info(message);
});
const scraped = scrape(window.$, window);
const valid = ajv.validate('main', scraped);
if (valid) {
  console.log(
    'The scraped compatibility data is valid, but please verify it is as ',
    'complete as possible'
  );
} else {
  console.error('please correct the errors in the scraped compatibility data:');
  console.error(ajv.errors);
  console.error('   ' + ajv.errorsText(ajv.errors, {
    separator: '\n    ',
    dataVar: 'item',
  }));
  console.error('see ' + gh('compat-data.schema.md') + ' for more info.');
}
// if not exists, check `https://github.com/mdn/mdn-browser-compat-data/`
console.log(scraped);
