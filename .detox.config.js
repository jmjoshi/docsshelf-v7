module.exports = {
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/YOUR_APP.app',
      build: 'xcodebuild -workspace ios/YOUR_APP.xcworkspace -scheme YOUR_APP -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/YOUR_APP.app',
      build: 'xcodebuild -workspace ios/YOUR_APP.xcworkspace -scheme YOUR_APP -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_30_x86'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
      runnerConfig: 'e2e/jest.config.js'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
      runnerConfig: 'e2e/jest.config.js'
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
      runnerConfig: 'e2e/jest.config.js'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release',
      runnerConfig: 'e2e/jest.config.js'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
      runnerConfig: 'e2e/jest.config.js'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
      runnerConfig: 'e2e/jest.config.js'
    }
  }
};
