const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
  const { id } = req.params; // Habit ID from URL parameter

  try {
    await client.connect();
    const db = client.db('LargeProject');
    const habit = await db.collection('habits').findOne({ _id: new ObjectId(id) });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Initialize or retrieve completedCount for tracking daily completions
    const completedCount = habit.completedCount || {};

    // Ensure today's completions are initialized
    if (!completedCount[currentDateString]) {
      completedCount[currentDateString] = 0;
    }

    const frequency = habit.frequency || 1; // Default frequency to 1 if not set

    // Check if the daily limit has been reached
    if (completedCount[currentDateString] >= frequency) {
      return res.status(400).json({ error: 'Habit already completed the maximum number of times today' });
    }

    // Increment today's completion count
    completedCount[currentDateString] += 1;

    // Update the habit in the database
    const updateFields = {
      lastCompleted: currentDate,
      completedCount: completedCount,
    };

    // Update the streak only if the habit hasn't already been completed today
    if (completedCount[currentDateString] === 1) {
      updateFields.streak = (habit.streak || 0) + 1;
    }

    const result = await db.collection('habits').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    // Respond with the updated habit
    if (result.value) {
      res.json(result.value);
    } else {
      res.status(404).json({ error: 'Habit not found' });
    }
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ error: 'An error occurred while completing the habit' });
  }
};
