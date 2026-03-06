exports.handler = async function(event, context) {
  try {
    const GOLD_API_KEY = 'b6fd78d95ff449908dfb3775e05700fc';
    

    // 金價 API (Twelve Data)
    const resGold = await fetch(
      `https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${GOLD_API_KEY}`
    );
    const rawGold = await resGold.json();
    const gold = parseFloat(rawGold.price);


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
