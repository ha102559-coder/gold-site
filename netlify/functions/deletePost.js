// netlify/functions/deletePost.js
// 驗證身份後刪除文章（敏感操作放後端）

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore }    = require('firebase-admin/firestore');
const { getAuth }         = require('firebase-admin/auth');

// 初始化 Firebase Admin（只初始化一次）
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

exports.handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // 取得 Authorization header
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: '請先登入' }) };

  try {
    // 驗證 Firebase ID Token
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const { postId } = JSON.parse(event.body || '{}');
    if (!postId) return { statusCode: 400, body: JSON.stringify({ error: '缺少 postId' }) };

    const postRef = db.collection('posts').doc(postId);
    const post    = await postRef.get();

    if (!post.exists) return { statusCode: 404, body: JSON.stringify({ error: '文章不存在' }) };

    const data = post.data();

    // 只有作者或 admin 可以刪除
    const userRef  = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const isAdmin  = userSnap.exists && userSnap.data().role === 'admin';

    if (data.authorId !== uid && !isAdmin) {
      return { statusCode: 403, body: JSON.stringify({ error: '無權限刪除此文章' }) };
    }

    // 軟刪除（標記為已刪除，保留資料）
    await postRef.update({ isDeleted: true, deletedAt: new Date().toISOString() });

    // 同時刪除該文章的所有回覆
    const repliesSnap = await db.collection('replies')
      .where('postId', '==', postId).get();
    const batch = db.batch();
    repliesSnap.docs.forEach(doc => batch.update(doc.ref, { isDeleted: true }));
    await batch.commit();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    console.error('deletePost error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
