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

module.exports = router;
