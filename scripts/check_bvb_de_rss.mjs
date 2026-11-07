import https from 'https';

const url = 'https://news.google.com/rss/search?q=site:bvb.de/de/de/aktuelles/news&hl=de&gl=DE&ceid=DE:de';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  }
}, (res) => {
  let xml = '';
  res.on('data', c => xml += c);
  res.on('end', () => {
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    console.log('Total items in site:bvb.de RSS:', items.length);
    items.slice(0, 15).forEach((item, idx) => {
      const t = item.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const l = item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const d = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1];
      console.log(`[${idx + 1}] ${d}`);
      console.log(`    TITLE: ${t}`);
      console.log(`    LINK:  ${l}`);
    });
  });
});
