exports.handler = async function(event, context) {
  try {
    const GOLD_API_KEY = 'b6fd78d95ff449908dfb3775e05700fc';
    const SILVER_API_KEY = 'JYZDGVVUENM3J9IQQWNU130IQQWNU';

    // 金價 API (Twelve Data)
    const resGold = await fetch(
      `https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${GOLD_API_KEY}`
    );
    const rawGold = await resGold.json();
    const gold = parseFloat(rawGold.price);

    // 銀價 API (另一個來源範例)
    const resSilver = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${SILVER_API_KEY}&base=USD&symbols=XAG`
    );
    const rawSilver = await resSilver.json();
    console.log('Silver response:', JSON.stringify(rawSilver));
    const silver = parseFloat(rawSilver.metals.silver);
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
          XAG: silver
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
