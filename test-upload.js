import { writeFileSync } from 'fs';
import FormData from 'form-data';

// Create a minimal test video file (just a small MP4 header)
// This is a minimal valid MP4 file structure
const testVideoBuffer = Buffer.from([
  0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
  0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
  0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
  0x6d, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08,
  0x66, 0x72, 0x65, 0x65
]);

// Save the test file
writeFileSync('test-video.mp4', testVideoBuffer);

async function testUpload() {
  try {
    console.log('Testing catbox.moe upload with video file...');
    
    // First, login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✓ Login successful');
    
    // Now upload the test video
    const form = new FormData();
    form.append('file', testVideoBuffer, {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    
    console.log('Uploading test video to catbox.moe...');
    const uploadResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Cookie': cookies
      }
    });
    
    const result = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      console.error('✗ Upload failed:', result);
      process.exit(1);
    }
    
    console.log('✓ Upload successful!');
    console.log('✓ File URL:', result.url);
    
    // Verify the URL is valid
    if (result.url && result.url.startsWith('https://files.catbox.moe/')) {
      console.log('✓ URL format is correct');
      console.log('\n✓ All tests passed!');
    } else {
      console.error('✗ URL format is incorrect:', result.url);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

testUpload();
