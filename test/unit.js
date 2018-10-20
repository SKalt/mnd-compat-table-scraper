/* eslint-disable no-irregular-whitespace, require-jsdoc */
import {
  checkUrl,
  assembleNotes,
  // getRows,
  // getHeaders,
  getBrowserNames,
  getTables,
  getFeatureNames,
  parseTable,
  parseCell,
  getNoteReference,
  scrape,
} from '../src/scraper/index.js';
// import path from 'path';
import {mathml} from './temp.json';
import {urlToPath} from '../src/url-to-path';
import assert from 'assert';
// import {readFileSync as rfs} from 'fs';
import {math, atDoc, mouseEnter} from './fixtures';
import {load} from 'cheerio';
import Ajv from 'ajv';
const [$1, $2, $3] = [math, atDoc, mouseEnter]
  .map((html) => load(html, {decodeEntities: false}));
const logJson = (obj) => console.log(JSON.stringify(obj, null, 2));
const ajv = new Ajv({allErrors: true});
import schema from 'mdn-browser-compat-data/schemas/compat-data.schema.json';
ajv.addSchema(schema, 'main');

function testSchema(ref = 'main', json = {}) {
  let valid = ajv.validate(ref, json);
  if (valid) {
    console.log('\x1b[32m  JSON schema – OK \x1b[0m');
    return false;
  } else {
    console.error(
      `\x1b[31m  JSON schema – ${ajv.errors.length} error(s)\x1b[0m`
    );
    console.error(ajv.errors);
    console.error('   ' + ajv.errorsText(ajv.errors, {
      separator: '\n    ',
      dataVar: 'item',
    }));
    return true;
  }
}

testSchema.ref = function(ref, json) {
  return testSchema({$ref: `main#/definitions/${ref}`}, json);
};

describe('urlToPath', ()=>{
  it('outputs as expected', ()=>{
    let url = '//developer.mozilla.org/en-US/docs/Web/MathML/Element/math';
    assert.equal(urlToPath(url), 'mathml/elements/math');
    url = 'https://developer.mozilla.org/en-US/docs/Web/CSS/@document';
    assert.equal(urlToPath(url), 'css/@document');
    url = 'https://developer.mozilla.org/en-US/docs/Web/Events/mouseenter';
    assert.equal(urlToPath(url), 'events/mouseenter');
  });
});
describe('checkUrl', ()=>{
  it('rejects non-mdn hosts', ()=>{
    assert(!checkUrl({host: 'mozilla.org'}));
  });
  it('accepts developer.mozilla.org', ()=>{
    assert(checkUrl({host: 'developer.mozilla.org'}));
  });
});
describe('getNotes', ()=>{
  it('returns correctly', ()=>{
    /* eslint-disable max-len */
    let expected = {
      1: 'Only supported in XHTML documents.',
      2: 'See <a href="https://bugs.webkit.org/show_bug.cgi?id=85733" class="external external-icon" rel="noopener">WebKit bug 85733</a>',
    };
    assert.deepEqual(assembleNotes($1), expected);
    expected = {
      1: 'Disabled by default in web pages, except for an empty <code>url-prefix()</code> value, which is supported due to its <a href="https://css-tricks.com/snippets/css/css-hacks-targeting-firefox/" class="external external-icon" rel="noopener">use in Firefox browser detection</a>. Still supported in user stylesheets.',
      2: 'From version 61: this feature is behind the <code>layout.css.moz-document.content.enabled</code> preference (needs to be set to <code>true</code>). To change preferences in Firefox, visit about:config.',
    };
    assert.deepEqual(assembleNotes($2), expected);
    expected = {
      1: 'Implemented in <a href="https://crbug.com/236215" class="external external-icon" rel="noopener">bug 236215</a>.',
      2: 'Implemented in <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=432698" title="FIXED: mouseenter and mouseleave events are not supported" class="external external-icon" rel="noopener">bug 432698</a>.',
      3: 'Safari 7 fires the event in many situations where it\'s not allowed to, making the whole event useless. See <a href="https://crbug.com/470258" class="external external-icon" rel="noopener">bug 470258</a> for the description of the bug (it existed in old Chrome versions as well). Safari 8 has correct behavior',
      4: 'Implemented in <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=218093" title="FIXED: disabled child element doesn\'t produce mouseout/mouseover pair" class="external external-icon" rel="noopener">bug 218093</a>.',
    };
    assert.deepEqual(assembleNotes($3), expected);
  });
});
describe('getBrowserName', ()=>{
  it('works', ()=>{
    let {mobile, desktop} = getTables($1);
    let expected = ['chrome', 'edge', 'firefox', 'ie', 'opera', 'safari'];
    assert.deepEqual(getBrowserNames(desktop, $1), expected);
    expected = [
      'webview_android',
      'chrome_android',
      'edge_mobile',
      'firefox_android',
      'opera_android',
      'safari_ios',
      'samsung',
    ];
    assert.deepEqual(getBrowserNames(mobile, $1), expected);
  });
});
describe('getFeatureNames', ()=>{
  it('returns as expected', ()=>{
    let {mobile, desktop} = getTables($1);
    let expected = [
      'Basic support',
      'dir',
      'display',
      'href',
      'mathbackground',
      'mathcolor',
      'mode',
      'overflow',
    ];
    assert.deepEqual(getFeatureNames(mobile, $1), expected);
    assert.deepEqual(getFeatureNames(desktop, $1), expected);
  });
});

describe('parsing experiment', ()=>{
  it('correctly parses tables', ()=>{
    let table = getTables($1);
    let notes = assembleNotes($1);
    parseTable(table.desktop, notes, $1);
    table = getTables($2);
    let confusing = `
    <p>
      61
      <span class=\"inlineIndicator prefixBox prefixBoxInline\" title=\"prefix\">
        <a href=\"/en-US/docs/Web/Guide/Prefixes\"
        title=\"The name of this feature is prefixed with '-moz-' as this
        browser considers it experimental\">
          -moz-
        </a>
      </span>
      <sup>
        <a href=\"#compatNote_1\">1</a>
      </sup>
      <sup><a href=\"#compatNote_2\">2</a></sup>
    </p>
    <p>
      1.5 — 61
      <span class=\"inlineIndicator prefixBox prefixBoxInline\"
      title=\"prefix\">
        <a href=\"/en-US/docs/Web/Guide/Prefixes\"
        title=\"The name of this feature is prefixed with '-moz-' as this
        browser considers it experimental\">
          -moz-
        </a>
      </span>
    </p>`;
    let $ = load(confusing);
    assert.deepEqual(
      parseCell(confusing, {1: 'foo', 2: 'bar'}, $),
      [
        {version_added: '61', notes: ['foo', 'bar'], prefix: '-moz-'},
        {version_added: '1.5', version_removed: '61', prefix: '-moz-'},
      ]
    );
    notes = assembleNotes($2);
    let json = parseTable(table.desktop, notes, $2);
    logJson(json);
    testSchema.ref('support_block', json);
    json = scrape($2);
    logJson(json);
    assert(testSchema.ref('identifier', mathml.elements.math));
    assert(testSchema.ref('identifier', json));
  });
});
describe('cell parsing', ()=>{
  it('correctly parses No', ()=>{
    const a = `
    <td class="no-support">
      <span title="No support">
          No
      </span>
    </td>`;
    const b = `
    <td>
      <span>
          No
      </span>
    </td>`;
    let $ = load(a);
    assert.deepEqual(parseCell(a, {}, $), {version_added: false});
    $ = load(b);
    assert.deepEqual(parseCell(b, {}, $), {version_added: false});
  });
  it('correctly parses prefixes', ()=>{
    const a = `
    <td class="full-support">
      6
      <span class="inlineIndicator prefixBox prefixBoxInline" title="prefix">
        <a href="/en-US/docs/Web/Guide/Prefixes" title="The name of this feature is prefixed with '-moz-' as this
        browser considers it experimental">
          -moz-
        </a>
      </span>
    </td>
    `;
    assert.equal(parseCell(a, {}, $1).prefix, '-moz-');
  });
  it('parses unknowns', ()=>{
    let idk = `
    <td>
      <span style="color: rgb(255, 153, 0);" title="Compatibility unknown; please update this.">
        ?
      </span>
    </td>`;
    assert.deepEqual(parseCell(idk, {}, $1), {version_added: null});
  });
  it('parses note references', ()=>{
    let a = `
    <td>
      <a href="/en-US/Firefox/Releases/44" title="Released on 2016-01-26.">
        44.0
      </a>
      (44.0)
      <sup>[4]</sup>
    </td>`;
    let expected = '4';
    let $ = load(a);
    assert.equal(getNoteReference(a, $), expected);
    assert.deepEqual(parseCell(a, {4: 'foo'}, $).notes, 'foo');
  });
});
