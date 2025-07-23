const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Employee Feedback System...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd frontend/client && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Check if .env file exists in backend
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating environment file...');
  try {
    const envExamplePath = path.join(__dirname, 'backend', 'env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Environment file created from template');
      console.log('⚠️  Please edit backend/.env with your configuration');
    } else {
      console.log('⚠️  env.example not found, please create backend/.env manually');
    }
  } catch (error) {
    console.error('❌ Failed to create environment file');
  }
} else {
  console.log('✅ Environment file already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit backend/.env with your MongoDB URI and JWT secret');
console.log('2. Start MongoDB (local or cloud)');
console.log('3. Run the application:');
console.log('   - Development: npm run dev');
console.log('   - Backend only: npm run backend');
console.log('   - Frontend only: npm run frontend');
console.log('\n🌐 Access the application:');
console.log('   - Frontend: http://localhost:3000');
console.log('   - Backend API: http://localhost:5000'); 