/**
 * Return whether we're on MDN
 * @param  {[type]} loc [description]
 * @return {[type]}     [description]
 */
const checkUrl = (loc) => loc.host === 'developer.mozilla.org';

function get(){
  let table = document.getElementById('AutoCompatibilityTable');
  if (!table) throw new Error('No compatibility table found');
  let desktop = document.getElementById('compat-desktop');
  let mobile = document.getElementById('compat-mobile');
  return {desktop, mobile};
}

const text = (el) => el.textContent; // suagar

const ownText = (el) => [...el.childNodes]
  .filter(node => node.nodeType === 3)
  .map(textNode => textNode.textContent)
  .join(' ')
  .trim()

const whats = (el) => {
  const sup = text(el.querySelector('sup') || {});
  return sup ? /\[(\d+)\]/.exec(sup)[1] : null; // not much, bro
}
const getInnerSpan = (td) => td.querySelector('span[title]')

const classNameToSupport = {
  'full': true,
  'no': false,
  'unknown': 'unknown'
};

/**
 * Returns whether the cell contains a `supported` value, like 'yes' or a
 * version
 * @param  {[type]}  td [description]
 * @return {Boolean}    [description]
 */
const isSupported = (td) => {
  for (let [type, value] of Object.entries(classNameToSupport)){
    if (td.classList.contains(`${type}-support`)) return value
  }
  const title_s = td.querySelectorAll('span[title]');
  return title_s.length > 0
    && title_s.length < 2
    && /Yes/i.exec(text(td));
}

const hasVersion = (td) => {
  // if it's not empty and not No or Yes
}
const getFootnote = (td) => {
  const sups = td.querySelectorAll('sup');

}

/**
 * given a table cell representing the compatibility of a browser with a web
 * technology, return a support_statement object
 * @param  {Element} td
 * @return {SupportStatement}
 */
function interpret(td) {
  let footnote;
  let result = {}
  if (td.children.length) {
    let sup = td.querySelector('sup');
    footnote = whats(sup);
    if (td.querySelector('span[title]') && /Yes/i.exec(text(td))) {
      result.version_supported = true;
    } else if () {

    }
  } else {

  }
// (yes)
  // sup \[\d+\]
  // [\d\.]+
  // \?
}

function parse(table) {
  const [header, ...rows] = [...table.querySelectorAll('tr')];
  const [defn, ...browsersThs] = [...header.querySelectorAll('th')];
  const browsers = browsersThs.map(text);
  rows.map((tr, index) => {
    let [featureEl, ...supportEls] = [...tr.querySelectorAll('td')];
    let feature = text(featureEl);
    let compat = supportEls
      .map((el, index)=>{
        return {browsers[index]: interpret(el)}
      })
      .reduce((a, b)=>Object.assign(a, b), {})
  });
}

const allBrowsers = [
  "webview_android",
  "chrome",
  "chrome_android",
  "edge",
  "edge_mobile",
  "firefox",
  "firefox_android",
  "ie",
  "nodejs",
  "opera",
  "opera_android",
  "qq_android",
  "safari",
  "safari_ios",
  "samsunginternet_android",
  "uc_android",
  "uc_chinese_android"
]
