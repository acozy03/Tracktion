// api/habits/delete.js

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../cors');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    try {
      await client.connect();
      const db = client.db('LargeProject');
      const result = await db.collection('habits').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      res.status(200).json({ message: 'Habit deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred deleting the habit' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
