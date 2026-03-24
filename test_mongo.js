const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  });
