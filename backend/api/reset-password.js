const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await client.connect();
    const db = client.db('LargeProject');
    const user = await db.collection('users').findOne({
      ResetToken: token,
      ResetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: user._id },
      { $set: { Password: newPassword }, $unset: { ResetToken: '', ResetTokenExpiry: '' } },
      { returnDocument: 'after' }
    );

    if (result.value) {
      res.json({ message: 'Password reset successful' });
    } else {
      res.status(500).json({ error: 'Failed to update password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while resetting the password' });
  }
};
