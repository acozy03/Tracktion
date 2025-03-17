// api/habits/[habitId]/complete.js

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

  const { habitId } = req.query;  // Get habitId from URL parameters

  if (!habitId) {
    return res.status(400).json({ error: 'Habit ID is required' });
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('LargeProject');
    
    // Find the habit by ID
    const habit = await db.collection('habits').findOne({ _id: new ObjectId(habitId) });
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get today's date and convert it to a string for tracking completion
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    // Initialize or retrieve completedCount for tracking daily completions
    const completedCount = habit.completedCount || {};

    // Ensure today's completions are initialized
    if (!completedCount[currentDateString]) {
      completedCount[currentDateString] = 0;
    }

    // Frequency control
    const frequency = habit.frequency || 1; // Default frequency to 1

    // Check if the daily limit has been reached
    if (completedCount[currentDateString] >= frequency) {
      return res.status(400).json({ error: 'Habit already completed the maximum number of times today' });
    }

    // Increment today's completion count
    completedCount[currentDateString] += 1;

    // Update the habit in the database with the new completion count and streak
    const updateFields = {
      lastCompleted: currentDate,
      completedCount: completedCount,
    };

    // Update the streak only if the habit hasn't already been completed today
    if (completedCount[currentDateString] === 1) {
      updateFields.streak = (habit.streak || 0) + 1;
    }

    // Update the habit in MongoDB
    const result = await db.collection('habits').findOneAndUpdate(
      { _id: new ObjectId(habitId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    // Respond with the updated habit data
    if (result.value) {
      res.status(200).json(result.value);
    } else {
      res.status(404).json({ error: 'Habit not found' });
    }
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();  // Close the MongoDB client
  }
};
