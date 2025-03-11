// cloudflare.config.js - Special configuration for Cloudflare deployments
export default {
  buildCommand: "npm install && npm run build",
  outputDirectory: "dist",
  route: "/*",
  apiUrl: "https://api.smartestnotes.com/api",
  telegramBotApiKey: "1234567890:AAAA-BBBBccccDDDDeeeeFFFgggHHHiiijjj"
};
