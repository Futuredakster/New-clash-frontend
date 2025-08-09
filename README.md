# Clash Frontend

The frontend application for the Clash Tournament Management System - a comprehensive platform for organizing and managing tournaments.

## Features

- **Tournament Management**: Create, edit, and manage tournaments
- **User Authentication**: Secure login and registration system
- **Participant Management**: Register and manage tournament participants
- **Bracket System**: Dynamic tournament bracket generation and management
- **Real-time Updates**: Live tournament progress tracking
- **Streaming Integration**: Built-in streaming capabilities for tournaments
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

- **React 18** - Frontend framework
- **React Bootstrap** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Formik** - Form management
- **JWT Decode** - Token handling
- **React Tournament Brackets** - Tournament visualization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Futuredakster/Clash-Frontend.git
cd Clash-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Environment Configuration

The application automatically detects the environment:
- **Development**: Uses `http://localhost:3001` for API calls
- **Production**: Uses the production backend URL

This is configured in `src/constant.js`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── Pages/              # Main page components
├── Brackets/          # Tournament bracket components
├── Streaming/         # Live streaming components
├── PraticipentView/   # Participant-facing components
├── FormComponents/    # Reusable form components
├── helpers/           # Utility functions and contexts
└── constant.js        # Environment configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Related Projects

- [Clash Backend](https://github.com/Futuredakster/Clash-Backend) - The backend API for this application

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
