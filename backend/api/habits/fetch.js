const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../cors');
module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with 200 for OPTIONS requests
  }
  const { UserID } = req.query;

  if (!UserID) {
    return res.status(400).json({ error: 'UserID is required' });
  }

  try {
    await client.connect();
    const db = client.db('LargeProject');
    const habits = await db.collection('habits').find({ UserID: parseInt(UserID) }).toArray();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred fetching habits' });
  }
};
