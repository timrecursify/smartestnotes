#!/bin/bash
# Script to ensure environment variables are loaded during Cloudflare Pages build

# Copy environment variables from .env.cloudflare to .env.production
cp .env.cloudflare .env.production

# Run the regular build command
npm run build
