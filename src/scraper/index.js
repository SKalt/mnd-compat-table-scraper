/* eslint-disable require-jsdoc */
import $ from 'cheerio';
import debug from 'debug';
debug.enable('scraper:*');
const logger = (name) => debug(`scraper:${name}`);
/**
 * Return whether we're on MDN
 * @param  {Object} loc window.location
 * @return {Boolean}
 */
export const checkUrl = (loc) => loc.host === 'developer.mozilla.org';

/**
 * Find the desktop and mobile compatability tables
 * @param  {String|Element} html a MDN API document
 * @return {Object} each browser compatibility table element.
 * @throws {Error} if no compatibility tables are present.
 */
export function getTables(html) {
  html = $(html);
  let desktop = html.find('#compat-desktop')[0];
  let mobile = html.find('#compat-mobile')[0];
  if (!desktop || !mobile) throw new Error('No compatibility table found');
  return {desktop, mobile};
}

export function getNotes(html) {
  const log = logger('get-notes');
  log('html', [...$(html).find('#Browser_compatibility')]);
  let notes = [
    ...$(html).find('#Browser_compatibility')
      .find('div.htab')
      .nextUntil('h2, h1, hr', /* <- break at; select only -> */ 'p'),
  ];
  log('notes', notes);
  let results = {};
  let state = '';
  for (let el of notes) {
    let re = /^\s*(\[\s{0,2}\d+\.?\s{0,2}\]|\d\.)(.*)/gm;
    let [id, text] = (re.exec(el.innerHTML) || []);
    if (id !== undefined) state = id.replace(/[\[\]\.\s]/g, '');
    if (el.id) state = e.id.replace(/compatnote_/i, '');
    if (!results[state]) results[state] = '';
    if (!text) text = el.innerHTML;
    results[state] += text;
  };
  return results;
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
