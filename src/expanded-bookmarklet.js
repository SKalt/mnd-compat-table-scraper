(
  (
    ()=>{
      fetch('https://skalt.github.io/mdn-compat-table-scraper/main.js')
        .then((r) => r.text())
        .then((js) => eval(js));
    }
  )()
);
