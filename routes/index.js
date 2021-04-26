const express = require('express');
const Parser = require('rss-parser');
const mcache = require('memory-cache');

const router = express.Router();
const parser = new Parser();

const cache = (duration) => (req, res, next) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cachedBody = mcache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};

// https://inv01back.herokuapp.com/

function extractDate(mas = [], linkdom = '') {
  const masTmp = [];
  mas.forEach((item) => {
    masTmp.push({
      linkdom,
      title: item.title ? item.title : '',
      link: item.link ? item.link : '',
      img: item.enclosure ? item.enclosure.url : '',
      content: item.content ? item.content : '',
      contentSnippet: item.contentSnippet ? item.contentSnippet : '',
      date: item.isoDate ? new Date(item.isoDate).toLocaleDateString('ru') : '',
    });
  });
  return masTmp;
}

router.get('/api/rss', cache(3600), (req, res) => {
  (async () => {
    try {
      let mas = [];
      const rssMos = await parser.parseURL('https://www.mos.ru/rss');
      const rssLenta = await parser.parseURL('https://lenta.ru/rss/news');
      mas = extractDate(rssMos.items, 'www.mos.ru')
        .concat(extractDate(rssLenta.items, 'www.lenta.ru'));
      await res.json(mas.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate)));
    } catch (e) {
      console.log(e);
    }
  })();
});

/*
router.get('/api/rss', cache(3600), (req, res) => {
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
        date: item.isoDate ? new Date(item.isoDate).toLocaleDateString('ru') : '',
      });
    });
    await res.json(mm);
  })();
});
*/

/* 2 Вариант с раздельными RSS. Оставил первый пока, добавил в него признак канала, так лучше для фильтра

router.get('/api/rss2', cache(3600), (req, res) => {
  (async () => {
    const rssMos = await parser.parseURL('https://www.mos.ru/rss');
    const rssLenta = await parser.parseURL('https://lenta.ru/rss/news');
    const masReturn = { mos: extractDate(rssMos.items), lenta: extractDate(rssLenta.items) };
    await res.json(masReturn);
  })();
});
*/

module.exports = router;
