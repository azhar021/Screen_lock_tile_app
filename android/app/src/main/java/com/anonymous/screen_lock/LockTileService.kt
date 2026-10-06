package com.anonymous.screen_lock

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Intent
import android.os.Build
import android.service.quicksettings.TileService

class LockTileService : TileService() {
    override fun onClick() {
        val dpm = getSystemService(DevicePolicyManager::class.java)
        val admin = ComponentName(this, LockDeviceAdminReceiver::class.java)
        val hasDeviceAdmin = dpm?.isAdminActive(admin) == true
        val isDeviceOwner = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && dpm?.isDeviceOwnerApp(packageName) == true

        if (hasDeviceAdmin || isDeviceOwner) {
            dpm?.lockNow()
            return
        }

        val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
            putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, admin)
            putExtra(
                DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                "Allow this app to lock the screen from the Quick Settings tile."
            )
        }
        startActivityAndCollapse(intent)
    }
}
