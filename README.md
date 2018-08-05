# mdn-compat-table-scraper
> pithy quote to motivate the project

## About
A set of scraping tools to [help convert MDN's HTML browser compatibility tables
into JSON](https://developer.mozilla.org/en-US/docs/MDN/Contribute/Structures/Compatibility_tables).
So far, the best MDN compat-table scraper is [Kayce Basques](https://github.com/kaycebasques)'s
[MDN Crawler](https://github.com/kaycebasques/mdncrawler).  This aims to improve
and re-export the tools for incorporation in bookmarklets/plugins/extensions/more
scrapers.

## Installation
`npm i [-S|-D] git+https://${this}` for the moment. The goal is to prep an
ES6+ module for npm publication.

## Usage
In initial development, you should be able to copy the code into any modern
browser, except for the import statements.  This is due to using [cheerio](https://github.com/cheeriojs/cheerio),
which has the same API as the JQuery MDN has on their pages.

## Developing

Roadmap:

[ ] gather the HTML of example pages (with an eye to diversity of table format)
[ ] Write JSON-testing function
[ ] Bundle exports
...later
[ ] make browser extension / plugin

### Further Resources
* [MDN's github repo of JSON browser compatibility data](https://github.com/mdn/browser-compat-data)
* [MDN's documentation on the old compatibility table structure](https://developer.mozilla.org/en-US/docs/MDN/Contribute/Structures/Old_compatibility_tables)
* [the schema test](https://github.com/mdn/browser-compat-data/tree/master/test)
## Acknowledgments
Test schema

https://github.com/epoberezkin/ajv
