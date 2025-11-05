# E2E Testing Setup Instructions

## Recommended Tool: Detox

### 1. Install Detox CLI and dependencies
```
npm install --save-dev detox detox-expo-helpers
```

### 2. Initialize Detox config
```
npx detox init
```

### 3. Configure Detox for Expo
- Add the following to your `package.json`:
```
"detox": {
  "testRunner": "jest",
  "runnerConfig": "e2e/config.json",
  "configurations": {
    "ios.sim.debug": {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 14"
      },
      "app": "path/to/your/expo/app"
    }
  }
}
```
- See Detox and Expo docs for latest configuration details.

### 4. Write E2E tests in `e2e/` folder
- Example test file: `e2e/registration.e2e.js`

### 5. Run E2E tests
```
npx detox test
```

## Notes
- E2E tests run on real devices/emulators and cover full UI and native module interactions.
- Always check compatibility of Detox/Expo versions before upgrading.
- Document E2E test results and limitations.

---

For more details, see:
- https://wix.github.io/Detox/docs/introduction/getting-started/
- https://docs.expo.dev/guides/testing-with-detox/
