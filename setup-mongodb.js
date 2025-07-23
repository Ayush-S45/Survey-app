const fs = require('fs');
const path = require('path');

console.log('🔧 MongoDB Setup Instructions\n');

console.log('Option 1: Install MongoDB Community Edition (Recommended)');
console.log('1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community');
console.log('2. Install it on your system');
console.log('3. Start MongoDB service');
console.log('4. The app will automatically connect to mongodb://localhost:27017/feedback-system\n');

console.log('Option 2: Use MongoDB Atlas (Cloud - Free)');
console.log('1. Go to https://www.mongodb.com/atlas');
console.log('2. Create a free account');
console.log('3. Create a new cluster');
console.log('4. Get your connection string');
console.log('5. Update backend/.env with your MongoDB Atlas URI\n');

console.log('Option 3: Use Docker (if you have Docker installed)');
console.log('docker run -d -p 27017:27017 --name mongodb mongo:latest\n');

console.log('For now, the app will run without MongoDB but database operations will fail.');
console.log('You can still test the frontend interface and see the UI components.');

// Check if .env exists
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ Environment file exists at backend/.env');
} else {
  console.log('\n⚠️  Environment file not found. Please run: cp backend/env.example backend/.env');
} 