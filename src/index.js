/* eslint-disable require-jsdoc, max-len */
/* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }]*/
import browserNames from './browser-names.json';
import _allBrowsers from './all-browsers.json';
const allBrowsers = new Set(_allBrowsers);
import {preprocess as parseUrl} from './url-to-path.js';
import {merge} from 'lodash';
/**
 * Return whether we're on MDN
 * @param  {Object} loc window.location
 * @return {Boolean}
 */
export const checkUrl = (loc) => loc.host === 'developer.mozilla.org';

/**
 * Find the desktop and mobile compatability tables
 * @param  {Object} $ a MDN API document jquery api
 * @return {Object} each browser compatibility table element.
 * @throws {Error} if no compatibility tables are present.
 */
export function getTables($) {
  let desktop = $('#compat-desktop')[0];
  let mobile = $('#compat-mobile')[0];
  if (!desktop || !mobile) throw new Error('No compatibility table found');
  return {desktop, mobile};
}

let re = /^\s*\[?\s*(\d+)\s*\]?\.?/;
function getNoteId(el, $) {
  let attr = ($(el).attr('id') || '').replace(/compatnote_/i, '');
  const match = $(el).text().match(re) || [];
  return attr || match[1];
}

export function getNotesElements($) {
  const find = ($el) => $el.nextUntil('h2, h1, hr', 'p').toArray();
  let els = find($('div.htab'));
  if (!els.length) els = els.concat(find($('div.htab').parent()));
  return els;
}

export function getNoteText(el, $) {
  return $(el).html().replace(re, '').trim().replace(' ', ' ');
}

export function assembleNote(el, $) {
  const id = getNoteId(el, $);
  const text = getNoteText(el, $);
  return text ? {[id]: text} : null;
}

export function assembleNotes($) {
  let notes = getNotesElements($);
  return notes
    .map((el) => assembleNote(el, $))
    .reduce((a, r) => Object.assign(a, r), {});
}

export const getRows = (table, $) => $(table).find('tr').toArray();
export const getHeaders = (table, $) => $(table).find('th').toArray();

export function getBrowserName(th, isMobile = false, $) {
  const text = $(th).text().trim();
  if (isMobile) {
    let mobilized = browserNames[`${text} Mobile`];
    if (mobilized) return mobilized;
  }
  return browserNames[$(th).text().trim()] || text;
}

export function getBrowserNames(table, isMobile = false, $) {
  return getHeaders(table, $)
    .slice(1)
    .map((th) => getBrowserName(th, isMobile, $));
}

export function getFeatureNames(table, $) {
  return $(table).find('td:first-child, th:first-child')
    .toArray().slice(1)
    .map((el) => $(el).text().trim());
}

export const getNoteReference = (cell, $) => {
  return [].concat(
    ...$(cell).find('sup')
      .toArray()
      .map((e) => $(e).text().match(/\d+/g) || [])
  );
};

export function parseStatus(find, $) {
  if (!find) find = $;
  let deprecated = Boolean(find('.deprecated').length);
  let standard_track = !Boolean(find('.nonStandard').length);
  let experimental = (
    Boolean(find('.notice.experimental').length)
    || (!standard_track && !deprecated)
  );
  return {experimental, standard_track, deprecated};
}

export function parseCellText(text) {
  if (text.match(/no/ig)) return {version_added: false};
  if (text.match(/(yes|full)/ig)) return {version_added: true};
  if (text.match(/(\?|unknown)/)) return {version_added: null};

  const range = text.match(/\s*([\d.\w]+)(\s*[-—]\s*)?([\d.\w]+)?/);
  let [version_added, version_removed] = [range[1], range[3]];
  return Object.assign(
    {version_added},
    version_removed && {version_removed},
  );
}

export function parseCell(cell, notes={}, $) {
  if ($(cell).find('br').toArray().length) {
    return $(cell).html()
      .split(/<\s*br\s*\/?>/ig)
      .map((str) => parseCell(`<td>${str}</td>`, notes, $))
      .reduce(toOneIfPossible, []);
  }

  let text = getOwnText(cell, $).trim();
  let children = $(cell).children('p').add(cell).filter('p').toArray();
  if (children.length) {
    children = [
      ...children.map((el) => `<td>${$(el).html()}</td>`),
    ].filter(Boolean);
    return children.map((cell) => parseCell(cell, notes, $));
  }
  // at this point, it's definitely *one* cell
  let prefix = $(cell).find('[class*="prefix"]').text().trim();
  let _notes = getNoteReference(cell, $)
    .map((ref) => notes[ref])
    .reduce(toOneIfPossible, []);
  return Object.assign(
    {},
    parseCellText(text || $(cell).find(':not([class*="prefix"] *):not(sup)').text()),
    _notes.length && {notes: _notes},
    prefix && {prefix},
  );
}

function __compat(
  supportEls,
  /* ctx: {description: str, mdn_url: str, status: obj} */
  notes = {},
  browserNames = browserNames,
  status = {},
  mdn_url = '',
  $
) {
  const result = {
    __compat: {
      status,
      support: Object.assign(
        ...supportEls.map(
          (el, index) => {
            let browser = browserNames[index];
            if (!allBrowsers.has(browser)) {
              console.error(
                browser + ' is not included in the compat data schema'
              );
              return {};
            } else {
              return {[browser]: parseCell(el, notes, $)};
            }
          }
        )
      ),
    },
  };
  if (mdn_url) result.__compat.mdn_url = mdn_url;
  return result;
}

export function parseRow(tr, notes={}, browserNames = browserNames, $) {
  let [featureEl, ...supportEls] = $(tr).find('td').toArray();
  let feature = $(featureEl).text().replace(
    /^\s*basic\ssupport\s*$/i,
    '__compat'
  ).replace(/[^a-zA-Z_0-9-$@]/g, '');
  let mdn_url = $(featureEl).find('a').attr('href');
  let status = parseStatus((s)=>$(featureEl).find(s).length || $(s).length);
  let compat = __compat(supportEls, notes, browserNames, status, mdn_url, $);
  return feature === '__compat' ? compat : {[feature]: compat};
}

export function parseTable(table, notes={}, isMobile = false, $) {
  const [header, ...rows] = $(table).find('tr').toArray();
  const browserNames = getBrowserNames(header, isMobile, $);
  return Object.assign(
    ...rows.map((tr) => parseRow(tr, notes, browserNames, $))
  );
}

// from https://stackoverflow.com/a/8851526/6571327
const getOwnText = (el, $) => $(el).clone().children().remove().end().text();

function toOneIfPossible(acc, curr, index, arr) {
  return arr.length === 1 ? arr[0] : arr;
}

function getContext({location}) {
  const mdn_url = (
    location.origin
    + location.pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/)
  );
  const [path, to, page] = parseUrl(mdn_url);
  return {mdn_url, path, to, page};
}

export function scrape($, globals) {
  const {mobile, desktop} = getTables($);
  const notes = assembleNotes($);
  const {path, to, page} = getContext(globals);
  let data = merge(
    parseTable(mobile, notes, true, $),
    parseTable(desktop, notes, false, $),
  );
  // console.log(JSON.stringify(data, null, 2));
  const inBrowserOrder = ({support, ...rest}) => {
    return {
      ...rest,
      support: merge(
        ..._allBrowsers.map(
          (b) => ({
            [b]: support[b] || {version_added: null},
          })
        )
      ),
    };
  };
  data = merge(
    ...Object.entries(data)
      .map(
        ([feature, value]) =>{
          if (feature === '__compat') return {__compat: inBrowserOrder(value)};
          let {__compat, ...rest} = value;
          return {[feature]: {__compat: inBrowserOrder(__compat), ...rest}};
        }
      )
  );
  // // console.log(Object.keys(data));
  // data = merge(
  //   ...Object.entries(data)
  //     .map(([compat, support]) => {
  //       return {
  //         [compat]: merge(
  //           ..._allBrowsers
  //             .map(
  //               (browswer) => ({
  //                 [browswer]: support[browswer] || {version_added: null},
  //               })
  //             )
  //         ),
  //       };
  //     })
  // );
  return page
    ? {[path]: {[to]: {[page]: data}}}
    : {[path]: {[to]: data}};
}

// if a featureEl has a link away from the current page, it may have its own
// support statement
export {urlToPath} from './url-to-path.js';
