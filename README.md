# mdn-compat-table-scraper
> We're converting our compatibility data into a machine-readable JSON format. ... Find out how you can help! -- MDN

## About
A set of scraping tools to [help convert MDN's HTML browser compatibility tables
into JSON](https://developer.mozilla.org/en-US/docs/MDN/Contribute/Structures/Compatibility_tables).
So far, the best MDN compat-table scraper is [Kayce Basques](https://github.com/kaycebasques)'s
[MDN Crawler](https://github.com/kaycebasques/mdncrawler).  This aims to improve
and re-export these scraping tools for possible reuse and bundle them in a working scraper, called via bookmarklet.


## Usage the bookmarklet to scrape old MDN compatibility tables
To use the scraper, go to https://skalt.github.io/mdn-compat-table-scraper/, save the bookmarklet to your bookmarks, then click it when you're on a MDN page that needs scraping.

## Installation for reuse in other projects
`npm install` or `yarn add [-S|-D] git+https://github.com/SKalt/mdn-compat-table-scraper.git`
You can use any of the scraping functions by `import {/* any non-trivial function */} from mdn-compat-table-scraper/src/index.js`. Most functions require a JQuery api `$` as their last arguement.  The top-level scraper reqires `window` as well, to access `window.location`, which can be mocked.

## Developing
```
git clone https://github.com/SKalt/mdn-compat-table-scraper.git 
cd mdn-compat-table-scraper

# using npm
npm ci
npm run test

# using yarn
yarn install
yarn run test
```


Roadmap:

[x] gather the HTML of example pages (with an eye to diversity of table format)

[x] Write JSON validation functions (using mdn's json schemas)

[x] Bundle the scraper as a bookmarklet

[ ] improve docs

### Further Resources
* [MDN's github repo of JSON browser compatibility data](https://github.com/mdn/browser-compat-data)
* [MDN's documentation on the old compatibility table structure](https://developer.mozilla.org/en-US/docs/MDN/Contribute/Structures/Old_compatibility_tables)
* [the schema test](https://github.com/mdn/browser-compat-data/tree/master/test)
