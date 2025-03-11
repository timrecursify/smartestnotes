// Special build script for Cloudflare Pages
import fs from 'fs';
import { execSync } from 'child_process';

// Create a clean package-lock.json that matches the package.json
console.log('🔄 Removing package-lock.json...');
try {
  fs.unlinkSync('./package-lock.json');
} catch (err) {
  // File might not exist, that's okay
}

// Set environment variables for the build
console.log('⚙️ Setting up environment variables...');
const envContent = `VITE_API_URL=https://api.smartestnotes.com/api
VITE_TELEGRAM_BOT_API_KEY=1234567890:AAAA-BBBBccccDDDDeeeeFFFgggHHHiiijjj`;

fs.writeFileSync('./.env.production', envContent);

// Install dependencies with npm install (not npm ci)
console.log('📦 Installing dependencies...');
execSync('npm install --no-package-lock', { stdio: 'inherit' });

// Build the project
console.log('🏗️ Building project...');
execSync('npm run build', { stdio: 'inherit' });

console.log('✅ Build completed successfully!');
