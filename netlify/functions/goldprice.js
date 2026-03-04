exports.handler = async function(event, context) {
  try {
    const API_KEY = 'b6fd78d95ff449908dfb3775e05700fc';

    // 黃金用 Twelve Data，白銀用 metals.live（免費無需Key）
    const [resGold, resSilver] = await Promise.all([
      fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${API_KEY}`),
      fetch(`https://api.metals.live/v1/spot/silver`)
    ]);

    const rawGold = await resGold.json();
    const rawSilver = await resSilver.json();

    const gold = parseFloat(rawGold.price);
    const silver = rawSilver[0]?.silver || gold / 80;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
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
