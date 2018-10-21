(
  (
    ()=>{
      fetch('https://raw.githubusercontent.com/skalt/mdn-compat-table-scraper/gh-pages/main.js')
        .then((r) => r.text())
        .then((js) => eval(js));
    }
  )()
);
