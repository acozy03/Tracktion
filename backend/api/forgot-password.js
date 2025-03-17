const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const setCorsHeaders = require('./cors');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with 200 for OPTIONS requests
  }
  const { email } = req.body;
  try {
    await client.connect();
    const db = client.db('LargeProject');
    const user = await db.collection('users').findOne({ Email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { ResetToken: resetToken, ResetTokenExpiry: resetTokenExpiry } }
    );

    const resetLink = `https://tracktion-jade.vercel.app/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      text: `Please click on the following link to reset your password: ${resetLink}`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};
