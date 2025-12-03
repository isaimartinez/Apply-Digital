# Hacker News Mobile App

A React Native mobile application built with Expo that fetches and displays articles from Hacker News using the Algolia API. The app features offline access, article management, favorites, and push notifications for new articles.

## Features

### Core Functionality
- **Data Fetching**: Fetches articles from Hacker News Algolia API on startup and pull-to-refresh
- **Offline Access**: Displays articles from the last session when offline
- **Article Viewing**: Lists articles in a scrollable view, sorted by date, with in-app WebView
- **Delete Functionality**: Swipe-to-delete articles (they won't reappear on refresh)

### Enhanced Features
- **Favorites**: Mark articles as favorites, accessible from dedicated tab
- **Deleted Articles View**: View and restore deleted articles
- **Push Notifications**: Receive notifications when new articles matching your interests are posted
- **User Preferences**: Configure notification settings and topics of interest
- **Background Fetch**: Automatically checks for new articles in the background

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage
- **API Client**: Axios
- **Gestures**: React Native Gesture Handler
- **Notifications**: Expo Notifications
- **Background Tasks**: Expo Background Fetch & Task Manager
- **Testing**: Jest, React Native Testing Library

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- iOS Simulator (macOS) or Android Emulator
- Expo Go app (for physical device testing)
- EAS CLI (for building)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd applyDigital
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install EAS CLI** (if not already installed)
   ```bash
   npm install -g eas-cli
   ```

## Running the App

### Development Server

Start the Expo development server:

```bash
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

### Development Build

For features requiring native code (notifications, background fetch), use a development build:

#### iOS Simulator Build

```bash
eas build --platform ios --profile ios-simulator
```

After build completes:
1. Download the `.app` file
2. Install on simulator: Press `Y` when prompted by EAS CLI, or use Expo Orbit

#### iOS Device Build

```bash
eas build --platform ios --profile development
```

#### Android Build

```bash
eas build --platform android --profile development
```

## Running Tests

The project includes comprehensive unit tests for services, stores, and components.

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Test Structure
```
__tests__/
├── services/
│   ├── api.test.ts           # API service tests
│   └── storage.test.ts       # Storage service tests
├── store/
│   └── articles.test.ts      # Article store tests
└── components/
    └── article-item.test.tsx # Component tests
```

## Project Structure

```
applyDigital/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Articles list
│   │   ├── favorites.tsx    # Favorites screen
│   │   └── deleted.tsx      # Deleted articles
│   ├── article/[id].tsx     # Article WebView
│   ├── settings.tsx         # Settings modal
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── article-item.tsx
│   ├── swipeable-article-item.tsx
│   └── ui/
├── services/                # Business logic
│   ├── api.ts              # Hacker News API
│   ├── storage.ts          # AsyncStorage wrapper
│   ├── notifications.ts    # Push notifications
│   └── background-fetch.ts # Background tasks
├── store/                   # Zustand stores
│   ├── articles.ts
│   └── preferences.ts
├── types/                   # TypeScript definitions
│   └── article.ts
├── hooks/                   # Custom React hooks
│   └── use-notifications.ts
├── constants/              # App constants
│   └── theme.ts
└── __tests__/             # Unit tests
```

## Features Guide

### Articles Screen
- Pull down to refresh articles
- Tap article to view in WebView
- Swipe left to delete
- Tap heart icon to favorite

### Favorites Screen
- View all favorited articles
- Same interactions as Articles screen

### Deleted Articles Screen
- View deleted articles
- Tap restore icon to undelete

### Settings
- Toggle push notifications on/off
- Select topics of interest
- Add custom topics
- Notifications request permission on first enable

### Notifications
- Automatically checks for new articles every 15 minutes (when enabled)
- Sends notification for new articles matching selected topics
- Tap notification to open article directly

## API Reference

### Hacker News Algolia API

**Endpoint**: `https://hn.algolia.com/api/v1/search_by_date`

**Parameters**:
- `query`: Search term (default: "mobile")
- `page`: Pagination (optional)

**Response**: Returns articles with metadata including title, author, URL, and timestamp.

## Configuration

### EAS Build Profiles

The app includes three build profiles in `eas.json`:

1. **development**: Development builds with dev client
2. **ios-simulator**: iOS Simulator-specific builds
3. **preview**: Internal distribution builds
4. **production**: Production builds for app stores

### Notifications Setup

Notifications require:
1. Physical device or development build (not Expo Go)
2. User permission grant
3. Topics selected in settings
4. Background fetch registered

## Troubleshooting

### Common Issues

**Problem**: Notifications not working
- **Solution**: Ensure using development build (not Expo Go), check permissions in Settings

**Problem**: Background fetch not triggering
- **Solution**: Background tasks have restrictions; test by backgrounding app for 15+ minutes

**Problem**: Tests failing
- **Solution**: Ensure all dependencies installed: `npm install`

**Problem**: Build fails
- **Solution**: Check EAS CLI version: `eas --version`, update if needed: `npm install -g eas-cli`

### Clearing Cache

If experiencing issues:
```bash
npx expo start --clear
```

### Clearing Storage

To reset app data, clear AsyncStorage from Settings or reinstall app.

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use functional components with hooks
- Keep components small and focused

### State Management
- Use Zustand for global state
- Keep local state in components when appropriate
- Async operations in store actions

### Testing
- Write tests for services and utilities
- Test store logic thoroughly
- Component tests for critical UI

## Performance Considerations

- Articles cached for offline access
- Background fetch limited to 15-minute intervals
- Lazy loading of WebView content
- Efficient re-renders with proper memoization

## Privacy & Permissions

### Required Permissions
- **Notifications**: For push notifications (optional, user-controlled)
- **Background Fetch**: To check for new articles (when notifications enabled)

### Data Storage
- All data stored locally using AsyncStorage
- No user accounts or personal data collected
- Article states (favorites, deleted) stored device-only

## License

This project is private and proprietary.

## Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

## Acknowledgments

- Hacker News for the content
- Algolia for the search API
- Expo team for the amazing framework
