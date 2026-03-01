// netlify/functions/deleteReply.js
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
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: '請先登入' }) };

  try {
    const decoded  = await getAuth().verifyIdToken(token);
    const uid      = decoded.uid;
    const { replyId } = JSON.parse(event.body || '{}');
    if (!replyId) return { statusCode: 400, body: JSON.stringify({ error: '缺少 replyId' }) };

    const replyRef  = db.collection('replies').doc(replyId);
    const replySnap = await replyRef.get();
    if (!replySnap.exists) return { statusCode: 404, body: JSON.stringify({ error: '回覆不存在' }) };

    const data     = replySnap.data();
    const userSnap = await db.collection('users').doc(uid).get();
    const isAdmin  = userSnap.exists && userSnap.data().role === 'admin';

    if (data.authorId !== uid && !isAdmin) {
      return { statusCode: 403, body: JSON.stringify({ error: '無權限刪除此回覆' }) };
    }

    await replyRef.update({ isDeleted: true, deletedAt: new Date().toISOString() });

    // 更新文章的 replyCount
    const postRef = db.collection('posts').doc(data.postId);
    const postSnap = await postRef.get();
    if (postSnap.exists) {
      const current = postSnap.data().replyCount || 1;
      await postRef.update({ replyCount: Math.max(0, current - 1) });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    console.error('deleteReply error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
