const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 5000;
//const port = 8080; 

// Middleware
app.use(cors());
app.use(bodyParser.json());


// MongoDB connection
const url = process.env.MONGODB_URL;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

client.connect()
  .then(() => {
    console.log("Connected successfully to MongoDB");
    db = client.db('LargeProject');
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to send email
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

app.get('/api/user-details', async (req, res) => {
  const { email, username } = req.query; // Accept both email and username as query parameters

  try {
    const usersCollection = db.collection('users');

    // Build query dynamically based on provided parameter
    const query = {};
    if (email) {
      query.Email = email;
    } else if (username) {
      query.Username = username;
    } else {
      return res.status(400).json({ success: false, error: 'Either email or username must be provided' });
    }

    // Find user by email or username
    const user = await usersCollection.findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Respond with the desired user details
    const { FirstName, LastName, UserID } = user;

    res.status(200).json({
      success: true,
      data: {
        firstName: FirstName,
        lastName: LastName,
        userID: UserID,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred while fetching user details' });
  }
});

//Registration route
app.post('/api/register', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  try {
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
    
    const verificationLink = `https://tracktion-backend.vercel.app/api/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email',
      `Please click on the following link to verify your email: ${verificationLink}`
    );
    
    res.status(201).json({ success: true, error: '', needsVerification: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'An error occurred during registration' });
  }
});

app.post('/api/registerMobile', async (req, res) => {
  const { Username, Email, FirstName, LastName, Password } = req.body;

  // Log each variable for debugging
  console.log('Received registration details:');
  console.log(`Username: ${Username}`);
  console.log(`Email: ${Email}`);
  console.log(`Password: ${Password}`); // Only for debugging; don't log passwords in production
  console.log(`First Name: ${FirstName}`);
  console.log(`Last Name: ${LastName}`);

  try {
    const usersCollection = db.collection('users');

    // Normalize username and email for consistent comparison
    const normalizedUsername = Username.toLowerCase();
    const normalizedEmail = Email.toLowerCase();

    console.log(`Checking for existing users with Username: ${normalizedUsername} or Email: ${normalizedEmail}`);

    const existingUser = await usersCollection.findOne({
      $or: [{ Username: normalizedUsername }, { Email: normalizedEmail }]
    });

    if (existingUser) {
      console.log('Existing user found:', existingUser);

      if (!existingUser.IsVerified) {
        console.log('User exists but is not verified.');
        return res.status(409).json({
          success: false,
          error: 'User exists but is not verified',
          needsVerification: true,
        });
      }

      console.log('Username or email is already taken.');
      return res.status(400).json({ success: false, error: 'Username or email already taken' });
    }

    console.log('No existing user found. Proceeding to register...');

    const lastUser = await usersCollection.find().sort({ UserID: -1 }).limit(1).toArray();
    const newUserID = lastUser.length > 0 ? lastUser[0].UserID + 1 : 1;

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const newUser = {
      Username: normalizedUsername,
      Email: normalizedEmail,
      Password: Password,
      FirstName,
      LastName,
      UserID: newUserID,
      VerificationToken: verificationToken,
      IsVerified: false,
    };

    console.log('Registering new user:', newUser);

    await usersCollection.insertOne(newUser);

    const verificationLink = `https://tracktion-backend.vercel.app/api/verify-email?token=${verificationToken}`;
    console.log('Sending verification email to:', normalizedEmail);
    await sendEmail(
      normalizedEmail,
      'Verify Your Email',
      `Please click on the following link to verify your email: ${verificationLink}`
    );

    // Move the response here to ensure it's sent after all processing is complete
    res.status(201).json({ success: true, error: '', needsVerification: true });
  } catch (e) {
    console.error('Error during registration:', e);
    res.status(500).json({ success: false, error: 'An error occurred during registration' });
  }
});

app.get('/api/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Invalid or missing token' });
  }

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ VerificationToken: token });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Invalid token or user not found' });
    }

    // Update the user's IsVerified status
    await usersCollection.updateOne(
      { VerificationToken: token },
      { $set: { IsVerified: true }, $unset: { VerificationToken: '' } }
    );

    // Instead of serving a static HTML file, send a JSON response
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: 'An error occurred during verification' });
  }
});



// Resend verification email route
app.post('/api/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ Email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.IsVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { VerificationToken: verificationToken } }
    );

    const verificationLink = `https://tracktion-backend.vercel.app/api/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email',
      `Please click on the following link to verify your email: ${verificationLink}`
    );

    res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'An error occurred while resending the verification email' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ Email: email });
    
    console.log('Forgot password request for email:', email);
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { ResetToken: resetToken, ResetTokenExpiry: resetTokenExpiry } }
    );

    const resetLink = `https://tracktion-backend.vercel.app/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `Please click on the following link to reset your password: ${resetLink}`
    );

    console.log('Password reset email sent successfully');
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Login route 
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await db.collection('users').findOne({
      $or: [{ Username: login }, { Email: login }]
    });
    
    console.log('Login attempt for:', login);
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ id: -1, firstName: '', lastName: '', error: 'User not found' });
    }

    console.log('Is user verified:', user.IsVerified);
    console.log('Provided password:', password);
    console.log('Stored password:', user.Password);

    if (user.Password !== password) {
      console.log('Incorrect password');
      return res.status(401).json({ id: -1, firstName: '', lastName: '', error: 'Incorrect password' });
    }

    if (!user.IsVerified) {
      console.log('User not verified');
      return res.status(403).json({ id: -1, firstName: '', lastName: '', error: 'Email not verified', needsVerification: true });
    }
   
    const { UserID, FirstName, LastName } = user;
    console.log('Login successful for user:', UserID);
    res.status(200).json({ id: UserID, firstName: FirstName, lastName: LastName, error: '' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ id: -1, firstName: '', lastName: '', error: 'An error occurred' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      ResetToken: token,
      ResetTokenExpiry: { $gt: Date.now() }
    });

    console.log('Reset password attempt for token:', token);
    console.log('User found:', user);

    if (!user) {
      console.log('Invalid or expired reset token');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    console.log('User before password reset:', user);

    const result = await usersCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { Password: newPassword },
        $unset: { ResetToken: "", ResetTokenExpiry: "" }
      },
      { returnDocument: 'after' }
    );

    console.log('User after password reset:', result.value);

    if (result.value) {
      console.log('Password reset successful');
      res.json({ message: 'Password reset successful', userId: user.UserID });
    } else {
      console.log('Failed to update user password');
      res.status(500).json({ error: 'Failed to update user password' });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'An error occurred while resetting your password' });
  }
});

// Get habits route
app.get('/api/habits', async (req, res) => {
  try {
    const { UserID } = req.query;

    if (!UserID) {
      return res.status(400).json({ error: 'UserID is required to fetch habits' });
    }

    const habits = await db.collection('habits').find({ UserID: parseInt(UserID) }).toArray();
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create habit route
app.post('/api/habits', async (req, res) => {
  try {
    const { name, measurementType, measurementUnit, frequency, goal, UserID } = req.body;

    if (!UserID) {
      return res.status(400).json({ error: 'UserID is required to create a habit' });
    }

    const habitGoal = goal || 30; // Default goal is 30 if not specified

    const newHabit = {
      name,
      measurementType,
      measurementUnit,
      frequency,
      streak: 0,
      goal: habitGoal,
      UserID
    };

    const result = await db.collection('habits').insertOne(newHabit);
    res.status(201).json({ ...newHabit, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update habit route
app.put('/api/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, measurementType, measurementUnit, frequency, streak, goal } = req.body;
    const result = await db.collection('habits').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, measurementUnit, frequency, streak, goal } },
      { returnDocument: 'after' }
    );
    if (result.value) {
      res.json(result.value);
    } else {
      res.status(404).json({ error: 'Habit not found' });
    }
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete habit route
app.delete('/api/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('habits').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ message: 'Habit deleted successfully' });
    } else {
      res.status(404).json({ error: 'Habit not found' });
    }
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete habit route
// app.put('/api/habits/:id/complete', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const habit = await db.collection('habits').findOne({ _id: new ObjectId(id) });

//     if (!habit) {
//       return res.status(404).json({ error: 'Habit not found' });
//     }

//     const lastCompletedDate = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
//     const currentDate = new Date();

//     if (lastCompletedDate && 
//         lastCompletedDate.getFullYear() === currentDate.getFullYear() &&
//         lastCompletedDate.getMonth() === currentDate.getMonth() &&
//         lastCompletedDate.getDate() === currentDate.getDate()) {
//       return res.status(400).json({ error: 'Habit already completed today' });
//     }

//     const result = await db.collection('habits').findOneAndUpdate(
//       { _id: new ObjectId(id) },
//       { 
//         $set: { 
//           lastCompleted: currentDate,
//           streak: habit.streak + 1
//         }
//       },
//       { returnDocument: 'after' }
//     );

//     if (result.value) {
//       res.json(result.value);
//     } else {
//       res.status(404).json({ error: 'Habit not found' });
//     }
//   } catch (error) {
//     console.error('Error completing habit:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.put('/api/habits/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the habit
    const habit = await db.collection('habits').findOne({ _id: new ObjectId(id) });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    // Initialize or retrieve completedCount for tracking daily completions
    const completedCount = habit.completedCount || {};

    // Ensure today's completions are initialized
    if (!completedCount[currentDateString]) {
      completedCount[currentDateString] = 0;
    }

    const frequency = habit.frequency || 1; // Default frequency to 1

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
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.use(express.static(path.join(__dirname, 'frontend/dist')));
// Serve index.html for the root route 
app.get('*', (req, res) => { 
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});