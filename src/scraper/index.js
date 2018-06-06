import $ from 'cheerio';

/**
 * Return whether we're on MDN
 * @param  {Object} loc window.location
 * @return {Boolean}
 */
export const checkUrl = (loc) => loc.host === 'developer.mozilla.org';

/**
 * Find the desktop and mobile compatability tables
 * @param  {String|Element} html a MDN API document
 * @return {Object} each browser compatibility table.
 * @throws {Error} if no compatibility tables are present.
 */
export function getTables(html) {
  let table = $(html).find('#AutoCompatibilityTable');
  if (table.toArray().length) throw new Error('No compatibility table found');
  let desktop = table.find('#compat-desktop');
  let mobile = table.find('#compat-mobile');
  return {desktop, mobile};
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
