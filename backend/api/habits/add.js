// api/habits/add.js

const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('./cors');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { name, frequency, goal, UserID } = req.body;

    if (!name || !frequency || !goal || !UserID) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      await client.connect();
      const db = client.db('LargeProject');
      const newHabit = {
        name,
        frequency,
        goal,
        UserID,
        streak: 0,  // Example default value for streak
        lastCompleted: null,  // Default value
      };

      const result = await db.collection('habits').insertOne(newHabit);
      res.status(201).json({ ...newHabit, _id: result.insertedId });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred adding the habit' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
