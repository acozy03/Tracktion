const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://tracktion-jade.vercel.app');  // Allow only your frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');  // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Allowed headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');  // If you're using cookies
  };
  
  module.exports = setCorsHeaders;
  