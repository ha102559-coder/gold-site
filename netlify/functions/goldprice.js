exports.handler = async function(event, context) {
  try {
    const API_KEY = process.env.METALS_API_KEY; // 改用環境變數

    const res = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${API_KEY}&base=USD&symbols=XAU,XAG,XPT,XPD`
    );
    const raw = await res.json();

    if (!res.ok) throw new Error(`Metals API error: ${res.status}`);

    const metals = raw.metals;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=1200'
      },
      body: JSON.stringify({
        metals: {
          XAU: parseFloat(metals.XAU),
          XAG: parseFloat(metals.XAG),
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
