const { MongoClient } = require('mongodb');
const setCorsHeaders = require('./cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (req, res) => {
  // Apply CORS headers
  setCorsHeaders(res);

  // Handle preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();  // Respond with 200 for OPTIONS requests
  }
  const { username, email, password, firstName, lastName } = req.body;

  try {
    await client.connect();
    const db = client.db('LargeProject');
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ $or: [{ Username: username }, { Email: email }] });

    if (existingUser) {
      if (!existingUser.IsVerified) {
        return res.status(409).json({ success: false, error: 'User exists but is not verified', needsVerification: true });
      }
      return res.status(400).json({ success: false, error: 'Username or email already taken' });
    }

    const lastUser = await usersCollection.find().sort({ UserID: -1 }).limit(1).toArray();
    const newUserID = lastUser.length > 0 ? lastUser[0].UserID + 1 : 1;
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const newUser = {
      Username: username,
      Email: email,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      UserID: newUserID,
      VerificationToken: verificationToken,
      IsVerified: false
    };
    await usersCollection.insertOne(newUser);
    
    const verificationLink = `https://tracktion-jade.vercel.app/api/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      text: `Please click on the following link to verify your email: ${verificationLink}`
    });
    
    res.status(201).json({ success: true, needsVerification: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'An error occurred during registration' });
  }
};
