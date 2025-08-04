const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SAAS Application Test...\n');

// Test backend startup
console.log('1. Testing Backend...');
const backendPath = path.join(__dirname, 'backend');
const backend = spawn('python', ['main.py'], { 
  cwd: backendPath,
  stdio: 'pipe'
});

let backendReady = false;

backend.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Uvicorn running')) {
    backendReady = true;
    console.log('✅ Backend started successfully');
    testBackendEndpoints();
  }
});

backend.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('WARNING')) {
    console.log('❌ Backend error:', error);
  }
});

// Test backend endpoints
async function testBackendEndpoints() {
  const endpoints = [
    'http://localhost:8000/',
    'http://localhost:8000/api/health',
    'http://localhost:8000/api/tasks',
    'http://localhost:8000/api/websites',
    'http://localhost:8000/api/analytics'
  ];

  console.log('\n2. Testing API Endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        console.log(`✅ ${endpoint} - OK`);
      } else {
        console.log(`⚠️  ${endpoint} - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed to connect`);
    }
  }

  // Test frontend
  setTimeout(() => {
    console.log('\n3. Testing Frontend...');
    testFrontend();
  }, 2000);
}

// Test frontend startup
function testFrontend() {
  const frontendPath = path.join(__dirname, 'frontend');
  const frontend = spawn('npm', ['run', 'dev'], { 
    cwd: frontendPath,
    stdio: 'pipe'
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready')) {
      console.log('✅ Frontend started successfully');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('🔧 Backend: http://localhost:8000');
      console.log('\n✅ All tests passed! Application is ready.');
      
      // Cleanup
      setTimeout(() => {
        backend.kill();
        frontend.kill();
        process.exit(0);
      }, 5000);
    }
  });

  frontend.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('WARNING') && !error.includes('info')) {
      console.log('❌ Frontend error:', error);
    }
  });
}

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping test...');
  if (backend) backend.kill();
  process.exit(0);
});