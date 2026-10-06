package com.anonymous.screen_lock

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Intent
import android.os.Build
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
            val dpm = reactContext.getSystemService(DevicePolicyManager::class.java)
            val adminComponent = ComponentName(reactContext, LockDeviceAdminReceiver::class.java)
            val isAdminActive = dpm?.isAdminActive(adminComponent) == true
            val isDeviceOwner = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                dpm?.isDeviceOwnerApp(reactContext.packageName) == true
            } else {
                false
            }
            val canLock = isAdminActive || isDeviceOwner

            val summary = when {
                canLock -> "Device admin access is active. The screen-lock tile can lock the device."
                else -> "Device admin is not active yet. Open Android settings to enable it."
            }

            val map = Arguments.createMap().apply {
                putBoolean("isDeviceOwner", isDeviceOwner)
                putBoolean("isAdminActive", isAdminActive)
                putBoolean("canLock", canLock)
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
                promise.reject("OPEN_DEVICE_ADMIN_FAILED", "No active Android activity was found.")
                return
            }
            val adminComponent = ComponentName(activity, LockDeviceAdminReceiver::class.java)
            val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent)
                putExtra(
                    DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                    "Allow this app to lock the screen from Quick Settings and the app UI."
                )
            }
            activity.startActivity(intent)
            promise.resolve("Opened device-admin settings.")
        } catch (e: Exception) {
            promise.reject("OPEN_DEVICE_ADMIN_FAILED", e.message ?: "Unable to open Android admin settings.", e)
        }
    }

    @ReactMethod
    fun lockDevice(promise: Promise) {
        try {
            val dpm = reactContext.getSystemService(DevicePolicyManager::class.java)
            val adminComponent = ComponentName(reactContext, LockDeviceAdminReceiver::class.java)
            val isAdminActive = dpm?.isAdminActive(adminComponent) == true
            val isDeviceOwner = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                dpm?.isDeviceOwnerApp(reactContext.packageName) == true
            } else {
                false
            }

            if (dpm == null || (!isAdminActive && !isDeviceOwner)) {
                promise.reject("LOCK_DEVICE_NOT_ALLOWED", "Enable device-admin access, then try the lock again.")
                return
            }

            dpm.lockNow()
            promise.resolve("Screen lock requested.")
        } catch (e: Exception) {
            promise.reject("LOCK_DEVICE_FAILED", e.message ?: "Lock request was rejected by Android.", e)
        }
    }

    companion object {
        const val NAME = "LockTileModule"
    }
}
