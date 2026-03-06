exports.handler = async function(event, context) {
  try {
    const API_KEY = process.env.METALS_API_KEY;
    const res = await fetch(
      `https://api.metals.dev/v1/latest?api_key=${API_KEY}&base=USD&symbols=XAU,XAG,XPT,XPD`
    );

    // 先檢查狀態碼，再解析 JSON
    if (!res.ok) throw new Error(`Metals API error: ${res.status}`);
    
    const raw = await res.json();
    
    // 防止 metals 欄位不存在（例如 API Key 錯誤）
    if (!raw.metals) throw new Error(raw.error || 'No metals data returned');
    
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
  XAU: parseFloat(metals.gold),      
  XAG: parseFloat(metals.silver),    
  XPT: parseFloat(metals.platinum),  
  XPD: parseFloat(metals.palladium),
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
