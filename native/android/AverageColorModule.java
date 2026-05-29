package com.fedrell;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import androidx.palette.graphics.Palette;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.File;

/**
 * Módulo nativo Android que extrae el color dominante de una imagen.
 * Requiere: implementation 'androidx.palette:palette:1.0.0' en build.gradle
 */
public class AverageColorModule extends ReactContextBaseJavaModule {

    public AverageColorModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AverageColor";
    }

    @ReactMethod
    public void getAverageColor(String imageUri, Promise promise) {
        try {
            String filePath = imageUri.startsWith("file://")
                ? imageUri.substring(7)
                : imageUri;

            Bitmap bitmap = BitmapFactory.decodeFile(filePath);
            if (bitmap == null) {
                promise.reject("DECODE_ERROR", "No se pudo decodificar la imagen: " + imageUri);
                return;
            }

            Palette palette = Palette.from(bitmap).generate();
            int dominantColor = palette.getDominantColor(Color.WHITE);
            String hex = String.format("#%06X", (0xFFFFFF & dominantColor));
            promise.resolve(hex);
        } catch (Exception e) {
            promise.reject("COLOR_ERROR", e.getMessage());
        }
    }
}
