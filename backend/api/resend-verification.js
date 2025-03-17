const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const setCorsHeaders = require('./cors');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
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

    if (user.IsVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { VerificationToken: verificationToken } }
    );

    const verificationLink = `https://tracktion-jade.vercel.app/api/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      text: `Please click on the following link to verify your email: ${verificationLink}`
    });

    res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while resending the verification email' });
  }
};
