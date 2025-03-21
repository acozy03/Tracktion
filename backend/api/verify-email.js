const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('./cors'); 
module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with 200 for OPTIONS requests
  }
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Invalid or missing token' });
  }

  try {
    await client.connect();
    const db = client.db('LargeProject');
    const user = await db.collection('users').findOne({ VerificationToken: token });

    if (!user) {
      return res.status(404).json({ error: 'Invalid token or user not found' });
    }

    await db.collection('users').updateOne(
      { VerificationToken: token },
      { $set: { IsVerified: true }, $unset: { VerificationToken: '' } }
    );

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during verification' });
  }
};
