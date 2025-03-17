const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
  const { login, password } = req.body;

  await client.connect();
  const db = client.db('LargeProject');

  try {
    const user = await db.collection('users').findOne({
      $or: [{ Username: login }, { Email: login }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.Password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    if (!user.IsVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    res.status(200).json({ id: user.UserID, firstName: user.FirstName, lastName: user.LastName });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
};
