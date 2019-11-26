package com.bluezoneinspection.app;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

import com.dylanvann.fastimage.FastImageViewPackage;
import com.chirag.RNMail.RNMail;
import com.rnziparchive.RNZipArchivePackage;
import com.RNFetchBlob.RNFetchBlobPackage;

import fr.bamlab.rnimageresizer.ImageResizerPackage;

import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.imagepicker.ImagePickerPackage;
import com.rnfs.RNFSPackage;

import io.realm.react.RealmReactPackage;

import com.oblador.vectoricons.VectorIconsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.kishanjvaghela.cardview.RNCardViewPackage;

import org.reactnative.camera.RNCameraPackage;

import codes.simen.IMEI.IMEI;

import com.kishanjvaghela.cardview.RNCardViewPackage;

import io.realm.react.RealmReactPackage;

import com.oblador.vectoricons.VectorIconsPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new FastImageViewPackage(),
                    new RNFirebasePackage(),
                    new RNFirebaseNotificationsPackage(),
                    new RNFirebaseMessagingPackage(),
                    new RNMail(),
                    new RNZipArchivePackage(),
                    new RNFetchBlobPackage(),
                    new ImageResizerPackage(),
                    new PickerPackage(),
                    new MapsPackage(),
                    new ImagePickerPackage(),
                    new RNFSPackage(),
                    new RealmReactPackage(),
                    new VectorIconsPackage(),
                    new RNDeviceInfo(),
                    new ReactNativeConfigPackage(),
                    new RNCardViewPackage(),
                    new RNCameraPackage(),
                    new IMEI()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new FastImageViewPackage(),
            new RNFirebasePackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new RNMail(),
            new RNZipArchivePackage(),
            new RNFetchBlobPackage(),
            new ImageResizerPackage(),
            new PickerPackage(),
            new MapsPackage(),
            new ImagePickerPackage(),
            new RNFSPackage(),
            new RealmReactPackage(),
            new VectorIconsPackage(),
            new RNDeviceInfo(),
            new ReactNativeConfigPackage(),
            new RNCardViewPackage(),
            new RNCameraPackage(),
            new IMEI()
      );
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
