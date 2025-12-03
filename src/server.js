require('dotenv').config(); // <-- make sure this is at the very top
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Missing MONGO_URI in environment variables');
    }

    await connectDB(); // now connectDB can use process.env.MONGO_URI safely

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();


