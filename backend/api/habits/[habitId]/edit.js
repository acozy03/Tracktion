// api/habits/[habitId]/edit.js

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../../cors');  // Import CORS middleware

module.exports = async (req, res) => {
  // Apply CORS headers
  setCorsHeaders(res);

  // Handle preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with 200 for OPTIONS requests
  }

  const { habitId } = req.query;  // Extract habitId from query parameters
  console.log("Editing", habitId);
  if (!habitId) {
    return res.status(400).json({ error: 'Habit ID is required' });
  }

  try {
    await client.connect();
    const db = client.db('LargeProject');

    const { name, measurementType, measurementUnit, frequency, streak, goal } = req.body;

    if (!name || !measurementUnit || !frequency || !goal) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await db.collection('habits').findOneAndUpdate(
      { _id: new ObjectId(habitId) },
      { $set: { name, measurementType, measurementUnit, frequency, streak, goal } },
      { returnDocument: 'after' }
    );

    if (result.value) {
      res.status(200).json(result.value);
    } else {
      res.status(404).json({ error: 'Habit not found' });
    }
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
};
