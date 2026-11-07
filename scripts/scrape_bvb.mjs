import https from 'https';

const url = 'https://www.bvb.de/de/de/aktuelles/news.html?subCategory=bvbweb%3Anews%2Fsub-category%2Fprofis';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'de-DE,de;q=0.9'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('HTML length:', data.length);
    
    // Check for JSON endpoints or hydration state script tags in BVB.de page
    const scriptTags = data.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log('Script tags count:', scriptTags.length);

    // Look for article links
    const linkMatches = [...data.matchAll(/href="(\/de\/de\/aktuelles\/news\/news-overflow\.html\/[^"]+)"/gi)];
    console.log('Found news-overflow links:', linkMatches.length);
    linkMatches.slice(0, 10).forEach(m => console.log('LINK:', 'https://www.bvb.de' + m[1]));

    // Search for titles / teasers
    const teaserMatches = [...data.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
    console.log('Found h3 tags:', teaserMatches.length);
    teaserMatches.slice(0, 10).forEach(m => console.log('H3:', m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()));

    // Search for 'Betis' or 'Champions'
    const betisIndex = data.indexOf('Betis');
    console.log('Betis found in HTML:', betisIndex !== -1);
    if (betisIndex !== -1) {
      console.log('Snippet around Betis:', data.substring(betisIndex - 100, betisIndex + 200).replace(/<[^>]+>/g, ' '));
    }
  });
}).on('error', err => console.log('Fetch error:', err));
