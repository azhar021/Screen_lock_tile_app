# Screen Lock Tile Demo

This project is a small Expo + React Native Android app that demonstrates a custom Quick Settings tile for locking the device screen.

It includes:
- a React Native UI for checking Android support
- a native Android module for device-admin support
- a custom Quick Settings tile service
- device-admin activation flow for screen lock permissions

## Requirements

- Node.js 18+
- Android Studio
- Android SDK
- An Android device or emulator
- A connected device with Developer Options enabled

## Install

```bash
npm install
```

## Run on Android

```bash
npx expo run:android
```

This rebuilds the native Android app and installs the Quick Settings tile.

## What the app does

- checks whether the app can lock the screen
- opens Android Device Admin settings when needed
- requests device-admin permission
- locks the device from the app UI
- exposes a custom Quick Settings tile to trigger the same lock

## Important Android notes

- Android requires device-admin permission before an app can lock the screen.
- The tile is only available after a native rebuild with `npx expo run:android`.
- If the tile does not appear, remove it from Quick Settings and add it again.

## Build release APK

```bash
cd android
./gradlew assembleRelease
```

The release APK will be generated in:

```text
android/app/build/outputs/apk/release/
```

## Project structure

```text
.
├── App.tsx
├── app.json
├── assets/
├── android/
├── index.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Notes

This project is intended as a demo and is focused on Android native integration for Quick Settings tile functionality.
