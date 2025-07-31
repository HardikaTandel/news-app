import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config.env') });

console.log('=== Environment Variables Test ===');
console.log('Current directory:', __dirname);
console.log('Config file path:', join(__dirname, 'config.env'));

console.log('\n=== Environment Variables ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'Present' : 'Missing');
console.log('GNEWS_API_KEY:', process.env.GNEWS_API_KEY ? 'Present' : 'Missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');

console.log('\n=== Google OAuth Check ===');
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth credentials are available');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...');
} else {
  console.log('❌ Google OAuth credentials are missing');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
} 