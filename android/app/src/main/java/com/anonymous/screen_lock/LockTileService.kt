package com.anonymous.screen_lock

import android.content.Intent
import android.service.quicksettings.TileService

class LockTileService : TileService() {
    override fun onClick() {
        if (!ScreenLockAccessibilityService.isEnabled(this)) {
            ScreenLockAccessibilityService.openAccessibilitySettings(this)
            return
        }

        val serviceIntent = Intent(this, ScreenLockAccessibilityService::class.java).apply {
            action = ScreenLockAccessibilityService.ACTION_LOCK_SCREEN
        }
        startService(serviceIntent)
    }
}
