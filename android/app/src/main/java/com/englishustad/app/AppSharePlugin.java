package com.englishustad.app;

import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "AppShare")
public class AppSharePlugin extends Plugin {
    private final AtomicBoolean preparing = new AtomicBoolean(false);
    private static final String TITLE = "Pashto to English: Learn & Play";

    @PluginMethod
    public void getInfo(PluginCall call) {
        File apk = new File(getContext().getApplicationInfo().sourceDir);
        JSObject result = new JSObject();
        result.put("sizeBytes", apk.length());
        call.resolve(result);
    }

    @PluginMethod
    public void shareApk(PluginCall call) {
        if (!preparing.compareAndSet(false, true)) {
            call.reject("An APK is already being prepared. Please wait.");
            return;
        }
        new Thread(() -> {
            try {
                File source = new File(getContext().getApplicationInfo().sourceDir);
                File directory = new File(getContext().getCacheDir(), "shared-apk");
                if (!directory.isDirectory() && !directory.mkdirs()) throw new java.io.IOException("Cannot prepare the share folder");
                File copy = new File(directory, "English-Ustad.apk");
                try (FileInputStream input = new FileInputStream(source); FileOutputStream output = new FileOutputStream(copy)) {
                    byte[] buffer = new byte[65536];
                    int count;
                    while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                }
                if (copy.length() != source.length()) throw new java.io.IOException("APK copy is incomplete");
                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", copy);
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("application/vnd.android.package-archive");
                send.putExtra(Intent.EXTRA_STREAM, uri);
                send.putExtra(Intent.EXTRA_SUBJECT, TITLE);
                send.putExtra(Intent.EXTRA_TEXT, "Install English Ustad to learn English with Pakistani Pashto help, pictures, spelling, stories and games.");
                send.setClipData(ClipData.newRawUri("English Ustad Android installer", uri));
                send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                launch(send, "Share APK with WhatsApp, email or another app", call);
            } catch (Exception exception) {
                preparing.set(false);
                call.reject("The APK could not be prepared. Please try again.", exception);
            }
        }, "english-ustad-apk-share").start();
    }

    @PluginMethod
    public void shareLink(PluginCall call) {
        String url = call.getString("url", "");
        Uri parsed = Uri.parse(url);
        if (!"https".equalsIgnoreCase(parsed.getScheme()) || parsed.getHost() == null || parsed.getUserInfo() != null) {
            call.reject("Add a public HTTPS download link first.");
            return;
        }
        String channel = call.getString("channel", "system");
        String text = TITLE + "\nLearn English with Pakistani Pashto help, pictures, listening, spelling, stories and games.\n\nDownload: " + url;
        Intent send;
        if ("email".equals(channel)) {
            send = new Intent(Intent.ACTION_SENDTO);
            send.setData(Uri.parse("mailto:"));
            send.putExtra(Intent.EXTRA_SUBJECT, TITLE);
            send.putExtra(Intent.EXTRA_TEXT, text);
        } else {
            send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, TITLE);
            send.putExtra(Intent.EXTRA_TEXT, text);
            if ("whatsapp".equals(channel)) send.setPackage("com.whatsapp");
        }
        launch(send, "Share app download link", call);
    }

    private void launch(Intent send, String title, PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                if ("com.whatsapp".equals(send.getPackage())) {
                    try { getActivity().startActivity(send); }
                    catch (ActivityNotFoundException absent) {
                        send.setPackage("com.whatsapp.w4b");
                        try { getActivity().startActivity(send); }
                        catch (ActivityNotFoundException noBusiness) {
                            send.setPackage(null);
                            getActivity().startActivity(Intent.createChooser(send, title));
                        }
                    }
                } else {
                    getActivity().startActivity(Intent.createChooser(send, title));
                }
                JSObject result = new JSObject();
                result.put("opened", true);
                call.resolve(result);
            } catch (Exception exception) {
                call.reject("No suitable sharing app opened. Please try another option.", exception);
            } finally {
                preparing.set(false);
            }
        });
    }
}
