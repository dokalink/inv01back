const express = require('express');
const Parser = require('rss-parser');

const router = express.Router();
const parser = new Parser();

// https://inv01back.herokuapp.com/

router.get('/api/rss', (req, res) => {
  (async () => {
    const rssMos = await parser.parseURL('https://www.mos.ru/rss');
    const rssLenta = await parser.parseURL('https://lenta.ru/rss/news');
    /*
    await res.json(rssMos.items.concat(rssLenta.items).sort(
      (a, b) => new Date(b.isoDate) - new Date(a.isoDate),
    ));
    */
    const mas = rssMos.items.concat(rssLenta.items).sort(
      (a, b) => new Date(b.isoDate) - new Date(a.isoDate),
    );
    const mm = [];
    mas.forEach((item) => {
      mm.push({
        title: item.title ? item.title : '',
        link: item.link ? item.link : '',
        img: item.enclosure.url ? item.enclosure.url : '',
        content: item.content ? item.content : '',
        contentSnippet: item.contentSnippet ? item.contentSnippet : '',
        author: item.author ? item.author : '',
      });
    });
    await res.json(mm);
  })();
});

module.exports = router;
