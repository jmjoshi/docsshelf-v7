# DocsShelf - Secure Document Management App 📄

DocsShelf is a cross-platform (iOS/Android) mobile application for secure document management with end-to-end encryption, OCR capabilities, and strict local storage.

## 🚀 Features

- **End-to-End Encryption**: All documents are encrypted at rest using AES-256-GCM
- **Offline-First**: Works completely offline with no cloud dependency
- **OCR Support**: Extract text from scanned documents
- **Biometric Authentication**: Secure access with fingerprint/Face ID
- **Document Organization**: Categories, tags, and versioning
- **Search**: Full-text search across all documents
- **Compliance**: GDPR and CCPA compliant

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- React Native development environment set up

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DocsShelf
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## 🏃‍♂️ Running the App

### Development Mode

```bash
# Start Expo development server
npm run start:dev

# Run on Android
npm run android:dev

# Run on iOS
npm run ios:dev

# Run on Web
npm run web
```

### Production Build

```bash
npm run start:prod
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

## 📁 Project Structure

```
DocsShelf/
├── app/                    # Expo Router pages
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # Screen components
│   ├── services/          # Business logic
│   ├── store/             # Redux state management
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── navigation/        # Navigation config
│   ├── i18n/              # Internationalization
│   └── config/            # App configuration
├── assets/                # Static assets
├── __tests__/            # Unit tests
└── e2e/                  # End-to-end tests
```

## 🔒 Security

- All data is encrypted at rest using AES-256-GCM
- Passwords are hashed using Argon2id
- Secure key storage using device keychain
- No data is sent to external servers without explicit user consent
- Regular security audits

## 📱 Supported Platforms

- iOS 13.0+
- Android 6.0+ (API 23+)
- Web (limited functionality)

## 🔧 Configuration

Key configuration files:
- `src/config/env.ts` - Environment variables
- `src/config/appConfig.ts` - App-wide settings
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration

## 📝 Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Expo config
- **Formatting**: Prettier (if configured)
- **Testing**: Jest with React Native Testing Library
- **Commit Messages**: Conventional Commits

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For issues and questions, please refer to the documentation in the `documents/` directory.

## 🔄 Version History

See [CHANGELOG.md](./documents/changelog/) for detailed version history.

---

Built with ❤️ using React Native and Expo
