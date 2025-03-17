// api/habits/edit.js

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../cors');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    const { id } = req.params;
    const { name, frequency, goal } = req.body;

    if (!id || !name || !frequency || !goal) {
      return res.status(400).json({ error: 'ID, name, frequency, and goal are required' });
    }

    try {
      await client.connect();
      const db = client.db('LargeProject');
      const result = await db.collection('habits').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { name, frequency, goal } },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      res.json(result.value);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred editing the habit' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
