const express = require('express');

const router = express.Router();

const Parser = require('rss-parser');

const parser = new Parser();

router.get('/api/all', (req, res, next) => {
  (async () => {
    const feed = await parser.parseURL('https://www.mos.ru/rss');
    const feed2 = await parser.parseURL('https://lenta.ru/rss/news');

    await res.json(feed.items.concat(feed2.items).sort(
      (a, b) => new Date(b.isoDate) - new Date(a.isoDate),
    ));
  })();
});

module.exports = router;
