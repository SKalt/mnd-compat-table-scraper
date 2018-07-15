import {
  checkUrl,
  assembleNotes,
  getRows,
  getHeaders,
  getBrowserNames,
  getTables,
} from '../src/scraper/index.js';
import {urlToPath} from '../src/url-to-path';
import assert from 'assert';
// import {readFileSync as rfs} from 'fs';
import {math, atDoc, mouseEnter} from './fixtures';
import {load} from 'cheerio';

const [$1, $2, $3] = [math, atDoc, mouseEnter]
  .map((html) => load(html, {decodeEntities: false}));

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
  it('fuckin works', ()=>{
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

    // console.log(getHeaders(desktop, $1).map((e) => getBrowserName(e, $1)))
    //  'chrome', 'edge', 'firefox', 'ie', 'opera', 'safari' ]
    // console.log(getHeaders(mobile, $1).map((e) => getBrowserName(e, $1)))


  });
})
