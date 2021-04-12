const express = require('express');
const Parser = require('rss-parser');

const router = express.Router();
const parser = new Parser();

function formatDate(date) {
  let dd = date.getDate();
  if (dd < 10) dd = `0${dd}`;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = `0${mm}`;

  let yy = date.getFullYear() % 100;
  if (yy < 10) yy = `0${yy}`;

  return `${dd}.${mm}.${yy}`;
}

// https://inv01back.herokuapp.com/

router.get('/api/rss', (req, res) => {
  (async () => {
    const rssMos = await parser.parseURL('https://www.mos.ru/rss');
    const rssLenta = await parser.parseURL('https://lenta.ru/rss/news');
    const mas = rssMos.items.concat(rssLenta.items).sort(
      (a, b) => new Date(b.isoDate) - new Date(a.isoDate),
    );
    const mm = [];
    mas.forEach((item) => {
      mm.push({
        title: item.title ? item.title : '',
        link: item.link ? item.link : '',
        img: item.enclosure ? item.enclosure.url : '',
        content: item.content ? item.content : '',
        contentSnippet: item.contentSnippet ? item.contentSnippet : '',
        date: item.isoDate ? formatDate(new Date(item.isoDate)) : '',
      });
    });
    await res.json(mm);
  })();
});

module.exports = router;
