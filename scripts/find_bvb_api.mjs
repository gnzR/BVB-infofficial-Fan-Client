import https from 'https';

const url = 'https://www.bvb.de/de/de/aktuelles/news.html?subCategory=bvbweb%3Anews%2Fsub-category%2Fprofis';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Search for API endpoints in Javascript strings
    const apiMatches = [...data.matchAll(/\/api\/[a-zA-Z0-9_\-\.\/]+/g)];
    console.log('API paths found:', apiMatches.map(m => m[0]).slice(0, 20));

    const jsonMatches = [...data.matchAll(/https?:\/\/[^"\']+\.json[^"\']*/g)];
    console.log('JSON URLs found:', jsonMatches.map(m => m[0]).slice(0, 20));

    // Search for subCategory occurrence
    const subCatIdx = data.indexOf('subCategory');
    if (subCatIdx !== -1) {
      console.log('SubCategory context:', data.substring(subCatIdx - 50, subCatIdx + 300));
    }
  });
});
