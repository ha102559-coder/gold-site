exports.handler = async function(event, context) {
  const API_KEY = process.env.METALS_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'API Key 未設定' })
    };
  }

  try {
    const res = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${API_KEY}&currency=USD&unit=toz`
    );

    if (!res.ok) {
      throw new Error(`Metals.dev 回應錯誤: ${res.status}`);
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
