const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
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
