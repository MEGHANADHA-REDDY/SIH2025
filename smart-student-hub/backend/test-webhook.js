#!/usr/bin/env node

/**
 * Test script for the Google Sheets automation webhook
 * Usage: node test-webhook.js [server-url]
 */

const http = require('http');
const https = require('https');

const SERVER_URL = process.argv[2] || 'http://localhost:5000';
const BASE_URL = `${SERVER_URL}/api/webhook`;

// Sample test data
const testData = {
  student_name: 'Alice Johnson',
  project_url: 'https://github.com/alice/amazing-project',
  course_name: 'Computer Science Engineering',
  status: 'approved',
  faculty_name: 'Dr. Sarah Wilson',
  certificate_id: 'TEST-CERT-001',
  validation_score: '92',
  readable_date: new Date().toLocaleDateString(),
  student_id: 'CSE2021042',
  student_db_id: 1, // Add this for built-in sheets
  activity_type: 'Project Development',
  category: 'Technical Project'
};

/**
 * Make HTTP request
 */
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebhookTestScript/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test health check endpoint
 */
async function testHealthCheck() {
  console.log('\n🔍 Testing health check endpoint...');
  try {
    const response = await makeRequest(`${BASE_URL}/health`);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log('❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

/**
 * Test webhook endpoint with sample data
 */
async function testWebhook() {
  console.log('\n📨 Testing webhook endpoint with sample data...');
  try {
    const response = await makeRequest(`${BASE_URL}/test`, 'POST');
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Test webhook passed');
      return true;
    } else {
      console.log('❌ Test webhook failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Test webhook error:', error.message);
    return false;
  }
}

/**
 * Test project status webhook with custom data
 */
async function testProjectStatus() {
  console.log('\n🎯 Testing project status webhook with custom data...');
  try {
    const response = await makeRequest(`${BASE_URL}/project-status`, 'POST', testData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Project status webhook passed');
      return true;
    } else {
      console.log('❌ Project status webhook failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Project status webhook error:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Google Sheets Automation Webhook Test Suite');
  console.log('==============================================');
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Webhook Base URL: ${BASE_URL}`);
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Health Check
  total++;
  if (await testHealthCheck()) {
    passed++;
  }
  
  // Test 2: Test Webhook
  total++;
  if (await testWebhook()) {
    passed++;
  }
  
  // Test 3: Project Status Webhook
  total++;
  if (await testProjectStatus()) {
    passed++;
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
    process.exit(1);
  }
}

/**
 * Display usage information
 */
function showUsage() {
  console.log('Google Sheets Automation Webhook Test Script');
  console.log('Usage: node test-webhook.js [server-url]');
  console.log('');
  console.log('Examples:');
  console.log('  node test-webhook.js');
  console.log('  node test-webhook.js http://localhost:5000');
  console.log('  node test-webhook.js https://your-domain.com');
  console.log('');
  console.log('This script tests the following endpoints:');
  console.log('  GET  /api/webhook/health');
  console.log('  POST /api/webhook/test');
  console.log('  POST /api/webhook/project-status');
  console.log('');
  console.log('Note: This now tests the built-in sheets system instead of Google Sheets.');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error.message);
  process.exit(1);
});
