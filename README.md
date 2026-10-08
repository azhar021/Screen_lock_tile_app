# Screen Lock

A lightweight Android application that adds a **Screen Lock Quick Settings tile** to your device.

The app is built with **Expo + React Native** and uses a native Android `AccessibilityService` to lock the device from the Quick Settings panel.

> **Android only.** iOS is not supported.

## Features

- 🔒 Lock the device from the app
- ⚡ Custom Android Quick Settings tile
- ♿ Uses Android Accessibility Service for screen locking
- 📱 Native Android implementation using Kotlin
- ⚛️ React Native / Expo-based UI
- 🔐 Locks the screen using Android's `GLOBAL_ACTION_LOCK_SCREEN`

## Download

Download the latest APK from the GitHub Releases page:

**[Download the latest APK](https://github.com//azhar021/Screen_lock_tile_app/releases)**

The release page will be updated whenever a new version is published.

> **Note:** Because this application uses Android's Accessibility Service, Android may restrict the Accessibility setting when the APK is installed outside Google Play. You may need to allow the application's restricted settings before enabling the service.

## Requirements

- Node.js 18+
- Android Studio
- Android SDK
- Android device or emulator
- Developer Options enabled when testing on a physical device

## Getting Started

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd screen-lock
npm install
```

## Run on Android

Build and install the application on a connected Android device:

```bash
npx expo run:android
```

This builds the native Android project and installs the application.

After installation, enable the **Screen Lock Accessibility Service** from Android Settings.

## Accessibility Service Setup

The application requires its Accessibility Service to be enabled before the Quick Settings tile can lock the device.

Go to:

```text
Settings
→ Accessibility
→ Screen Lock
→ Enable
```

If Android shows:

```text
Controlled by restricted setting
```

for a sideloaded APK, allow restricted settings for the application from:

```text
Settings
→ Apps
→ Screen Lock
→ ⋮
→ Allow restricted settings
```

Then return to the Accessibility settings and enable the service.

## How It Works

The application uses Android's `AccessibilityService` API and the `GLOBAL_ACTION_LOCK_SCREEN` global action to lock the device.

The basic flow is:

```text
Quick Settings
      │
      ▼
Screen Lock Tile
      │
      ▼
TileService
      │
      ▼
AccessibilityService
      │
      ▼
GLOBAL_ACTION_LOCK_SCREEN
      │
      ▼
Lock Device
```

This approach uses Android's accessibility global action instead of `DevicePolicyManager.lockNow()`.

## Quick Settings Tile

After installing the application:

1. Open the Android Quick Settings panel.
2. Tap the **Edit** button.
3. Find **Screen Lock**.
4. Add the tile to Quick Settings.
5. Make sure the Accessibility Service is enabled.
6. Tap the tile to lock the device.

If the tile does not appear immediately after installation, remove it from Quick Settings and add it again.

## Accessibility Service

The native Android service is implemented using:

```text
ScreenLockAccessibilityService
```

The service uses:

```kotlin
performGlobalAction(
    AccessibilityService.GLOBAL_ACTION_LOCK_SCREEN
)
```

No root access is required.

## Building a Release APK

To build a release APK locally:

### Linux / macOS

```bash
cd android
./gradlew assembleRelease
```

### Windows

```powershell
cd android
.\gradlew.bat assembleRelease
```

The generated APK will be available at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure

```text
.
├── App.tsx
├── app.json
├── assets/
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── java/
│               ├── res/
│               └── AndroidManifest.xml
├── index.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Tech Stack

- **React Native**
- **Expo**
- **TypeScript**
- **Kotlin**
- **Android SDK**
- **Android AccessibilityService**
- **Android Quick Settings TileService**

## Open Source

This project is open source. The source code is available in this repository for developers to inspect, learn from, modify, and contribute to.

The project demonstrates how to integrate **native Android functionality into an Expo/React Native application**, including:

- Android Quick Settings tiles
- Native Kotlin services
- Accessibility Service integration
- Communication between React Native and native Android functionality

## Limitations

- Android only
- Requires the Accessibility Service to be manually enabled
- Android may restrict Accessibility Services for applications installed outside Google Play
- Quick Settings tile appearance and behavior are controlled by Android System UI
- Device behavior may vary between Android versions and manufacturers

## Contributing

Contributions, bug reports, and suggestions are welcome.

If you find a bug or have an idea for an improvement, please open an issue or submit a pull request.

## License

This project is open source. See the `LICENSE` file for details.
