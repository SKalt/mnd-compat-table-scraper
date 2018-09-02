/* eslint-disable require-jsdoc, max-len */
/* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }]*/
import browserNames from './browser-names.json';
import allBrowsers from './all-browsers.json';
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
  return $('div.htab').nextUntil('h2, h1, hr', 'p').toArray();
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

export function getBrowserName(th, $) {
  return browserNames[$(th).text().trim()];
}

export function getBrowserNames(table, $) {
  return getHeaders(table, $).slice(1).map((th) => getBrowserName(th, $));
}

export function getFeatureNames(table, $) {
  return $(table).find('td:first-child, th:first-child')
    .toArray().slice(1)
    .map((el) => $(el).text());
}

export const getNoteReference = (cell, $) => {
  return [].concat(
    ...$(cell).find('sup')
      .toArray()
      .map((e) => $(e).text().match(/\d+/g) || [])
  );
};

export function status($) {
  return {
    experimental: Boolean($('.notice.experimental').length),
    standard_track: !Boolean($('.nonStandard').length),
    deprecated: Boolean($('.deprecated').length),
  };
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
      .split(/<\s*br\s*\/>/ig)
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

function sortByBrowserName(support) {
  return allBrowsers
    .map((name) => ({[name]: support[name]}))
    .reduce((a, r) => Object.assign(a, r), {});
}

export function parseRow(tr, notes={}, browserNames=[], $) {
  let [featureEl, ...supportEls] = $(tr).find('td').toArray();
  let featureName = $(featureEl).text().trim();
  let result = {
    __compat: {
      support: Object.assign(
        ...supportEls.map(
          (el, index) => {
            let browser = browserNames[index];
            return {[browser]: parseCell(el, notes, $)};
          }
        )
      ),
    },
  };
  if (!featureName.match(/basic\s+support/i)) result = {[featureName]: result};
  return result;
}

export function parseTable(table, notes={}, $) {
  const [header, ...rows] = $(table).find('tr').toArray();
  const browserNames = getBrowserNames(header, $);
  return Object.assign(
    {},
    ...rows.map((tr) => parseRow(tr, notes, browserNames, $))
  );
}

// from https://stackoverflow.com/a/8851526/6571327
const getOwnText = (el, $) => $(el).clone().children().remove().end().text();

function toOneIfPossible(acc, curr, index, arr) {
  return arr.length === 1 ? arr[0] : arr;
}

export function scrape($) {
  const {mobile, desktop} = getTables($);
  const notes = assembleNotes($);
  return Object.assign(
    ...[mobile, desktop].map((el) => parseTable(el, notes, $))
  );
}

// export function status(featureEl, href = '', $) {
//   let a = $(featureEl).find('a')
//   href = href.replace('/[a-z]{2}-[A-Z]{2}/', '/').replace(/#.+$/, '');
//   if (a.length > 0 && a[0].href.test(href))
//   const check = (selector) => Boolean($(selector).toArray().length);
//   let experimental = check('.notice.experimental');
//   let standard_track = !experimental && check('#Specifications');
//   let deprecated = !experimental && !standard_track && check('.deprecated');
//   return {experimental, standard_track, deprecated};
// };
