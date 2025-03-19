// api/habits/add.js

const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../cors');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    console.log('Received POST request for adding a habit');
    console.log('Request Body:', req.body);

    const { name, measurementType, measurementUnit, frequency, goal, UserID } = req.body;

    if (!name || !measurementType || !measurementUnit || !frequency || !goal || !UserID) {
      console.error('Validation Error: Missing fields', { name, measurementType, measurementUnit, frequency, goal, UserID });
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      console.log('Connecting to database...');
      await client.connect();
      const db = client.db('LargeProject');

      const newHabit = {
        name,
        measurementType,
        measurementUnit,
        frequency,
        goal,
        UserID,
        streak: 0,
        lastCompleted: null,
      };

      console.log('Inserting habit into database:', newHabit);

      const result = await db.collection('habits').insertOne(newHabit);

      console.log('Habit added successfully:', result.insertedId);

      res.status(201).json({ ...newHabit, _id: result.insertedId });
    } catch (error) {
      console.error('Error adding habit:', error);
      res.status(500).json({ error: 'An error occurred adding the habit' });
    } finally {
      console.log('Closing database connection');
      await client.close();
    }
  } else {
    console.warn('Invalid request method:', req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
