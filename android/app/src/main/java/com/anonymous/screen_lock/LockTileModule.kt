package com.anonymous.screen_lock

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LockTileModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun getSupportStatus(promise: Promise) {
        try {
            val isAccessibilityEnabled = ScreenLockAccessibilityService.isEnabled(reactContext)
            val summary = if (isAccessibilityEnabled) {
                "Accessibility lock is enabled. The app can trigger the system lock without forcing strong authentication."
            } else {
                "Accessibility permission is not enabled yet. Open Android settings to enable the screen-lock accessibility service."
            }

            val map = Arguments.createMap().apply {
                putBoolean("isDeviceOwner", false)
                putBoolean("isAdminActive", false)
                putBoolean("canLock", isAccessibilityEnabled)
                putBoolean("supportsGoToSleep", true)
                putString("summary", summary)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("GET_SUPPORT_STATUS_FAILED", e.message ?: "Unable to read support status", e)
        }
    }

    @ReactMethod
    fun openDeviceAdminSettings(promise: Promise) {
        try {
            val activity = reactContext.currentActivity ?: run {
                promise.reject("OPEN_ACCESSIBILITY_SETTINGS_FAILED", "No active Android activity was found.")
                return
            }
            ScreenLockAccessibilityService.openAccessibilitySettings(activity)
            promise.resolve("Opened Android accessibility settings.")
        } catch (e: Exception) {
            promise.reject("OPEN_ACCESSIBILITY_SETTINGS_FAILED", e.message ?: "Unable to open Android accessibility settings.", e)
        }
    }

    @ReactMethod
    fun lockDevice(promise: Promise) {
        try {
            if (!ScreenLockAccessibilityService.isEnabled(reactContext)) {
                ScreenLockAccessibilityService.openAccessibilitySettings(reactContext)
                promise.reject("LOCK_DEVICE_NOT_ALLOWED", "Enable the accessibility permission, then try the lock again.")
                return
            }

            val serviceIntent = Intent(reactContext, ScreenLockAccessibilityService::class.java).apply {
                action = ScreenLockAccessibilityService.ACTION_LOCK_SCREEN
            }
            reactContext.startService(serviceIntent)
            promise.resolve("Screen lock requested via accessibility service.")
        } catch (e: Exception) {
            promise.reject("LOCK_DEVICE_FAILED", e.message ?: "Lock request was rejected by the system.", e)
        }
    }

    companion object {
        const val NAME = "LockTileModule"
    }
}
