# Smartest Notes: Notes 2.0

A modern, AI-powered note-taking web application integrated with Telegram.

## Features

- **Telegram Integration**: Seamless authentication and synchronization with Telegram
- **AI Enrichment**: Automatically enhance notes with AI-powered insights
- **Markdown Support**: Write and view notes with full Markdown formatting
- **Advanced Search**: Search through notes with filters and highlighting
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v7+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smartestnotes.git
   cd smartestnotes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=https://your-api-url.com/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deployment

The application is configured for deployment to GitHub Pages:

```bash
npm run deploy
```

## Technology Stack

- **Frontend**: React, React Router, React Query, Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Telegram Login
- **API Communication**: Axios
- **Deployment**: GitHub Pages

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/pages` - Application pages
  - `/services` - API service layer

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.
