exports.handler = async function(event, context) {
  try {
    const API_KEY = process.env.GOLDAPI_KEY;

    const fetchMetal = async (symbol) => {
      const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
        headers: { 'x-access-token': API_KEY }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return { price: data.price, open: data.open_price, change_pct: data.ch_24h };
    };

    const [gold, silver, platinum, palladium] = await Promise.all([
      fetchMetal('XAU'),
      fetchMetal('XAG'),
      fetchMetal('XPT'),
      fetchMetal('XPD')
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=7200'
      },
      body: JSON.stringify({
        metals: {
          XAU: gold.price, XAU_open: gold.open, XAU_pct: gold.change_pct,
          XAG: silver.price, XAG_open: silver.open, XAG_pct: silver.change_pct,
          XPT: platinum.price, XPT_open: platinum.open, XPT_pct: platinum.change_pct,
          XPD: palladium.price, XPD_open: palladium.open, XPD_pct: palladium.change_pct
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
