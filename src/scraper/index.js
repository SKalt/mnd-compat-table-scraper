/* eslint-disable require-jsdoc */
import debug from 'debug';
debug.enable('scraper:*');
// const logger = (name) => debug(`scraper:${name}`);
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
  return [...$('div.htab').nextUntil('h2, h1, hr', 'p')];
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


export const whats = (el) => {
  const sup = $(el).find('sup').text();
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


// const hasVersion = (td) => {
//   // if it's not empty and not No or Yes
// };

// const getFootnote = (td) => {
//   const sups = td.querySelectorAll('sup');
// };

// /**
//  * given a table cell representing the compatibility of a browser with a web
//  * technology, return a support_statement object
//  * @param  {Element} td
//  * @return {SupportStatement}
//  */
// function interpret(td) {
//   let footnote;
//   let result = {};
//   if (td.children.length) {
//     let sup = td.querySelector('sup');
//     footnote = whats(sup);
//     if (td.querySelector('span[title]') && /Yes/i.exec(text(td))) {
//       result.version_supported = true;
//     }
//   } else {
//
//   }
// // (yes)
//   // sup \[\d+\]
//   // [\d\.]+
//   // \?
// }

// /**
//  * [parse description]
//  * @param  {[type]} table [description]
//  */
// export function parse(table) {
//   table = $(table);
//   const [header, ...rows] = table.find('tr').toArray();
//   const [defn, ...browsersThs] = $(header).find('th').toArray();
//   const browsers = browsersThs.map(text);
//   rows.map((tr, index) => {
//     let [featureEl, ...supportEls] = tr.find('td').toArray();
//     let feature = featureEl.text();
//     let compat = supportEls
//       .map((el, index)=>{
//         return {[index]: interpret(el)};
//       })
//       .reduce((a, b)=>Object.assign(a, b), {});
//   });
//   return compat;
// }
