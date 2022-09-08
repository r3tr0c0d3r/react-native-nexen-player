package com.retrocoder.nexenplayer

import android.app.Activity
import android.os.Build
import android.util.Log
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class NexenPlayerModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    val context: ReactApplicationContext?

    init {
        this.context = context
    }

    override fun getName(): String {
        return "NexenPlayerModule"
    }

    @ReactMethod
    fun showSystemBar() {
        Log.d("NexenPlayerModule", "showSystemBar: called")
        val activity: Activity = context?.getCurrentActivity() ?: return
        val window = activity.getWindow()
        val decoreView = window.getDecorView()

        UiThreadUtil.runOnUiThread {
            WindowCompat.setDecorFitsSystemWindows(window, true)
            WindowInsetsControllerCompat(window, decoreView).show(WindowInsetsCompat.Type.systemBars())

            if (Build.VERSION.SDK_INT >= 28) {
                window.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT
            }
        }

    }

    @ReactMethod
    fun hideSystemBar() {
        Log.d("NexenPlayerModule", "hideSystemBar: called")
        val activity: Activity = context?.getCurrentActivity() ?: return
        val window = activity.getWindow()
        val decoreView = window.getDecorView()

        UiThreadUtil.runOnUiThread {
            WindowCompat.setDecorFitsSystemWindows(window, false)
            WindowInsetsControllerCompat(window, decoreView).let { controller ->
                controller.hide(WindowInsetsCompat.Type.systemBars())
                controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }

            if (Build.VERSION.SDK_INT >= 28) {
                window.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }
    }

    @ReactMethod
    fun setBrightness(brightness: Float) {
        Log.d("NexenPlayerModule", "setBrightness: called")
        val activity: Activity = context?.getCurrentActivity() ?: return
        val lp = activity.window.attributes
        lp.screenBrightness = brightness
        UiThreadUtil.runOnUiThread {
            activity.window.attributes = lp
        }
    }

}
