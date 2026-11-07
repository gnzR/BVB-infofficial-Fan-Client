import https from 'https';

const endpoints = [
  'https://www.bvb.de/de/de/aktuelles/news.model.json',
  'https://www.bvb.de/de/de/aktuelles/news/_jcr_content.model.json',
  'https://www.bvb.de/content/bvb/de/de/aktuelles/news.model.json',
  'https://www.bvb.de/de/de/aktuelles/news.bvbnewslist.json',
  'https://www.bvb.de/de/de/aktuelles/news/jcr:content.json',
  'https://news.google.com/rss/search?q=site:bvb.de/de/de/aktuelles/news&hl=de&gl=DE&ceid=DE:de',
  'https://www.google.com/search?q=site:bvb.de/de/de/aktuelles/news&tbm=nws',
];

for (const ep of endpoints) {
  https.get(ep, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': '*/*'
    }
  }, (res) => {
    console.log(`[${res.statusCode}] ${ep}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200 && data.length > 50) {
        console.log(`  --> Returned ${data.length} bytes. Sample:`, data.substring(0, 150).replace(/\s+/g, ' '));
      }
    });
  }).on('error', err => console.log(`[ERR] ${ep}:`, err.message));
}
