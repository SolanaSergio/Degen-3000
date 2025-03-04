const axios = require('axios');

async function testRoast(message, level = 5) {
  try {
    const response = await axios.post('http://localhost:8000/api/roast', {
      message,
      level
    });
    console.log('\n=== Test Message ===');
    console.log('Input:', message);
    console.log('Level:', level);
    console.log('\n=== Response ===');
    console.log(response.data.message);
    console.log('\n=== Stats ===');
    console.log('Length:', response.data.message.length);
    console.log('Source:', response.data.source);
    console.log('==================\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runTests() {
  // Test different topics
  const testCases = [
    { message: "I'm a programmer", level: 5 },
    { message: "I'm ugly", level: 5 },
    { message: "I'm stupid", level: 5 },
    { message: "I'm poor", level: 5 },
    { message: "I'm single", level: 5 },
    { message: "I'm a failure", level: 5 }
  ];

  for (const test of testCases) {
    await testRoast(test.message, test.level);
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

runTests(); 