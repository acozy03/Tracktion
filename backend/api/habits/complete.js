// api/habits/complete.js

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('../cors');

module.exports = async (req, res) => {
  // Apply CORS headers to allow cross-origin requests
  setCorsHeaders(res);

  // Handle preflight request (OPTIONS method)

  // Ensure we are dealing with a PUT request
  if (req.method === 'PUT') {
    const { habitId } = req.params;  // Get habitId from URL parameters

    if (!habitId) {
      return res.status(400).json({ error: 'Habit ID is required' });
    }

    try {
      // Connect to MongoDB
      await client.connect();
      const db = client.db('LargeProject');

      // Check if the habit exists
      const habit = await db.collection('habits').findOne({ _id: new ObjectId(habitId) });
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      // Logic to mark the habit as completed
      const currentDate = new Date();
      const updateData = {
        lastCompleted: currentDate,
        streak: habit.streak + 1,  // Increment the streak
      };

      // Update the habit in the database
      const result = await db.collection('habits').updateOne(
        { _id: new ObjectId(habitId) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ error: 'Failed to complete habit' });
      }

      // Respond with the updated habit
      res.status(200).json({
        message: 'Habit completed successfully',
        habitId,
        lastCompleted: currentDate,
        streak: habit.streak + 1,
      });
    } catch (error) {
      console.error('Error completing habit:', error);
      res.status(500).json({ error: 'An error occurred completing the habit' });
    } finally {
      await client.close();  // Close the MongoDB client
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });  // Handle unsupported methods
  }
};
