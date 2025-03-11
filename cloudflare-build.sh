#!/bin/bash
# This is a custom build script for Cloudflare Pages

# Print commands for debugging
set -x

# Delete any package-lock.json to prevent conflicts
rm -f package-lock.json

# Install dependencies using plain npm install (not npm ci)
npm install

# Build the application
npm run build

# Success message
echo "✅ Build completed successfully!"
