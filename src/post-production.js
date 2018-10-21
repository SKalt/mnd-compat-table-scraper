const fs = require('fs');
const path = require('path');
const expanded = fs.readFileSync(
  path.resolve(__dirname, 'expanded-bookmarklet.js'),
  'utf8'
);
const bookmarklet = `href="javascript:${encodeURIComponent(expanded.trim())}"`;
const pageLoc = path.resolve(__dirname, '../dist/index.html');
let page = fs.readFileSync(pageLoc, 'utf8');
fs.writeFileSync(pageLoc, page.replace(/href="[^"]+"/, bookmarklet), 'utf8');
const bundleLoc = path.resolve(__dirname, '../dist/main.js');
const bundle = fs.readFileSync(bundleLoc, 'utf8');
fs.writeFileSync(bundleLoc, bundle.replace('main.map', './main.map'), 'utf8');
