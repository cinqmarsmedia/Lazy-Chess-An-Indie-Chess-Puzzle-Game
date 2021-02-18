import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { DeviceFeedback } from "@ionic-native/device-feedback";
import { TapticEngine } from "@ionic-native/taptic-engine";
import { IonicStorageModule } from "@ionic/storage";
import { LaunchReview } from '@ionic-native/launch-review';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ChessboardModule } from 'ng2-chessboard';
import { AngularFireModule } from 'angularfire2';
import { KeyPressDirective } from "../key-press/key-press";

import { AngularFireDatabaseModule } from 'angularfire2/database';

import { fbConfig } from './../constants';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    KeyPressDirective
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    ChessboardModule,
    AngularFireModule.initializeApp(fbConfig),
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    DeviceFeedback,
    TapticEngine,
    SplashScreen,
    LaunchReview,
    //InAppPurchase2,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
