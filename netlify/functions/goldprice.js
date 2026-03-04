exports.handler = async function(event, context) {
  try {
    const API_KEY = 'b6fd78d95ff449908dfb3775e05700fc';

    const [resGold, resSilver] = await Promise.all([
      fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${API_KEY}`),
      fetch(`https://api.twelvedata.com/price?symbol=XAG/USD&apikey=${API_KEY}`)
    ]);

    const rawGold = await resGold.json();
    const rawSilver = await resSilver.json();

    const gold = parseFloat(rawGold.price);
    const silver = parseFloat(rawSilver.price);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'  // 快取5分鐘
      },
      body: JSON.stringify({
        metals: {
          XAU: gold,
          XAG: silver,
          XPT: gold * 0.92,
          XPD: gold * 0.60
        }
      })
    };

  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
