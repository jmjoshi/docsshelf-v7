# Testing Strategy and Recommendations

## Unit Testing
- Use Jest for all business logic, validation, and utility functions.
- Example: Password validation, utility helpers, service logic.
- Fast, reliable, and fully supported in React Native/Expo projects.

## Integration/UI Testing
- For screens and components, use a dedicated E2E testing tool:
  - **Detox** (recommended for React Native)
  - **Expo E2E** (if using Expo managed workflow)
- These tools run tests on real devices/emulators and handle native modules correctly.
- Jest is not suitable for deep React Native UI tests due to native module limitations.

## Documentation
- Document this strategy in your project for all contributors.
- Always check compatibility before adding new packages or tools.
- Track and document all changes for rollback and audit purposes.

## Summary
- Continue robust unit testing with Jest.
- Plan for E2E testing setup for UI/integration coverage.
- Document limitations and best practices for future development.

---

**Limitation:**
Jest cannot fully execute React Native screens/components that depend on native modules. Use E2E tools for full UI coverage.

**Best Practice:**
- Use Jest for logic/unit tests.
- Use Detox/Expo E2E for UI/integration tests.
- Document this approach for all future features.
