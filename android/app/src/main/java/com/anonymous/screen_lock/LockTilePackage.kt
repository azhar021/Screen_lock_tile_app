package com.anonymous.screen_lock

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class LockTilePackage : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == LockTileModule.NAME) {
            LockTileModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                LockTileModule.NAME to ReactModuleInfo(
                    LockTileModule.NAME,
                    LockTileModule.NAME,
                    false,
                    false,
                    false,
                    true,
                    false
                )
            )
        }
    }
}
