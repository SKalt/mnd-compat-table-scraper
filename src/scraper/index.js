/* eslint-disable require-jsdoc, max-len */
/* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }]*/
import browserNames from './browser-names.json';
// import {zip} from '../common/utils.js';
import debug from 'debug';
// debug.enable('scraper:*');
const logger = (name) => debug(`scraper:${name}`);
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
  const match = $(el).html().match(re) || [];
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
//
// function parseRow(row, featureName, browserNames, notes, $) {
//   //
// }


export function parseCellText(text) {
  const log = logger('cell-text');
  // log({text})
  if (text.match(/no/ig)) return {version_added: false};
  if (text.match(/(yes|full)/ig)) return {version_added: true};
  if (text.match(/(\?|unknown)/)) return {version_added: null};
  debugger;

  const range = text.match(/\s*([\d.\w]+)(\s*[-—]\s*)?([\d.\w]+)?/);
  log({range});
  let [version_added, version_removed] = [range[1], range[3]];
  return Object.assign(
    {version_added},
    version_removed && {version_removed},
  );
}

export function parseCell(cell, notes={}, $) {
  const log = logger('parse-cell');
  if ($(cell).find('br').toArray().length) {
    return $(cell).html()
      .split(/<\s*br\s*\/>/ig)
      .map((str) => parseCell(`<td>${str}</td>`, notes, $))
      .reduce(toOneIfPossible, []);
  }

  let text = getOwnText(cell, $).trim();
  log({owntext: text});
  let children = $(cell).children('p').add(cell).filter('p').toArray();
  log('selfish text', $(cell).find(':not([class*="prefix"] *):not(sup)').toArray().map((e) => $(e).html()));
  if (children.length) {
    debugger;
    children.forEach((e) => console.log($(e).html()));
    children = [
      ...children.map((el) => `<td>${$(el).html()}</td>`),
      // /\S/.test(text) && `<td>${text}</td>`,
    ].filter(Boolean);
    return children.map((cell) => parseCell(cell, notes, $));
  }
  // for when it's definitely *one* cell
  // get the prefix?
  // get the number|range|true|false|null
  debugger;
  let prefix = $(cell).find('[class*="prefix"]').text().trim();
  let refs = getNoteReference(cell, $)
    .map((ref) => notes[ref])
    .reduce(toOneIfPossible, []);
  return Object.assign(
    {},
    parseCellText(text || $(cell).find(':not([class*="prefix"] *):not(sup)').text()),
    refs.length && {notes: refs},
    prefix && {prefix},
  );
}

// const getTds = (table, $) => $(table).
export function parseTable(table, notes={}, $) {
  const [header, ...rows] = $(table).find('tr').toArray();
  const browserNames = getBrowserNames(header, $);
  return rows.map((tr) => {
    let [featureEl, ...supportEls] = $(tr).find('td').toArray();
    let featureName = $(featureEl).text();
    return supportEls.map((el, index) => {
      let browser = browserNames[index];
      return {[featureName]: {
        browser, html: $(el).html(),
        children: parseCell(el, notes, $),
      }};
    });
  });
  return compat;
}

// from https://stackoverflow.com/a/8851526/6571327
const getOwnText = (el, $) => $(el).clone().children().remove().end().text();

// // from https://github.com/kaycebasques/mdncrawler/blob/master/server.js
// function convertSupportValue(value) {
//   if (value.includes('[')) return value;
//   if (value.includes('Yes')) return true;
//   if (value.includes('No') && value.includes('support')) return false;
//   if (value === '?') return null;
//   const number = Number(value);
//   // "7.0" => "7"
//   if (!isNaN(number)) return number.toString();
//   // "7.0 (7.0)" => "7"
//   if (/^[0-9]+\.*[0-9]*\s*(.*)$/.test(value)) {
//     return Number(value.substring(0, value.indexOf(' '))).toString();
//   }
//   return value;
// }

export const whats = (el) => {
  const sup = $(el).find('sup').toArray().text();
  return sup ? /\[(\d+)\]/.exec(sup)[1] : null; // not much, bro
};

const classNameToSupport = {
  'full': true,
  'no': false,
  'unknown': 'unknown',
};

/**
 * Returns whether the cell contains a `supported` value, like 'yes' or a
 * version
 * @param  {Element|cheerio.Selection} td
 * @return {Boolean}
 */
export const isSupported = (td) => {
  td = $(td);
  for (let [type, value] of Object.entries(classNameToSupport)) {
    if (td.hasClass(`${type}-support`)) return value;
  }
  const titled = td.find('span[title]').toArray();
  return titled.length > 0
    && titled.length < 2
    && /Yes/i.exec(text(td));
};

function toOneIfPossible(acc, curr, index, arr) {
  return arr.length === 1 ? arr[0] : arr;
}
