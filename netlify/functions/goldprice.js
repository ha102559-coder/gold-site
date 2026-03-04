exports.handler = async function(event, context) {
  try {
    const TWELVE_KEY = 'b6fd78d95ff449908dfb3775e05700fc';
    const METALS_KEY = 'JYZDGVVUENM3J9IQQWNU130IQQWNU';

    const [resGold, resSilver] = await Promise.all([
      fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${TWELVE_KEY}`),
      fetch(`https://metals.dev/api/latest?api_key=${METALS_KEY}&currency=USD&unit=troy_oz`)
    ]);

    const rawGold = await resGold.json();
    const rawSilver = await resSilver.json();

    const gold = parseFloat(rawGold.price);
    const silver = rawSilver.metals.XAG;
    const platinum = rawSilver.metals.XPT;
    const palladium = rawSilver.metals.XPD;

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
          XPT: platinum,
          XPD: palladium
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
