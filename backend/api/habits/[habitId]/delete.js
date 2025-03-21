// api/habits/delete.js

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../../cors');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    const { habitId } = req.query;
    console.log('Received DELETE request with HABITID:', habitId);
    if (!habitId) {
      return res.status(400).json({ error: 'HABITID is required' });
    }

    try {
      await client.connect();
      const db = client.db('LargeProject');
      console.log("reached 1");
      const test = await db.collection('habits').findOne({ _id: new ObjectId(habitId) });
      console.log("reached 2 : ", test); 
      const result = await db.collection('habits').deleteOne({ _id: new ObjectId(habitId) });

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
