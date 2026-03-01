// netlify/functions/setAdmin.js
// 將指定使用者設為管理員（需要 ADMIN_SECRET 環境變數驗證）

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth }      = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { secret, targetEmail } = JSON.parse(event.body || '{}');

  // 用 ADMIN_SECRET 環境變數驗證，不需要登入
  if (secret !== process.env.ADMIN_SECRET) {
    return { statusCode: 403, body: JSON.stringify({ error: '密碼錯誤' }) };
  }

  try {
    const userRecord = await getAuth().getUserByEmail(targetEmail);
    await db.collection('users').doc(userRecord.uid).set(
      { role: 'admin', email: targetEmail },
      { merge: true }
    );
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, message: `${targetEmail} 已設為管理員` }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
