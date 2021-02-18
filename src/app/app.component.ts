import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Events } from "ionic-angular";

import { HomePage } from "../pages/home/home";
@Component({
  templateUrl: "app.html",
})
export class MyApp {
  rootPage: any = HomePage;
  difficulty: any = 2;
  thinkTime: any = 700;
  ptheme: any = "alpha";
  mode:any="nBest";
  color:any='default';
  visible: any = true;
  upgraded:any=false;
  iOS: any = navigator.userAgent.match(/Mac|iPhone|iPad|iPod/i);
  winHeight:any=window.innerHeight;
  newChallenges:any=0;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public events: Events
  ) {

    platform.ready().then(() => {
      statusBar.backgroundColorByName("black");
      statusBar.styleLightContent();
      splashScreen.hide();
    });

    events.subscribe("updateThinkTime", (val) => {
      this.thinkTime = val;
      this.eventPublish("thinktime", val);
    });


    events.subscribe("updateChallenges", (val) => {
      this.newChallenges = val;
  //    this.eventPublish("thinktime", val);
    });


    events.subscribe("updateDifficulty", (val) => {
      this.difficulty = val;
      this.eventPublish("difficulty", val);
    });

 events.subscribe("updateColor", (val) => {
      this.color = val;
 });

 events.subscribe("updateMode", (val) => {
   console.log(val);
      this.mode = val;
 });

  events.subscribe("30stars", (val) => {
this.upgraded=true;
 });


    events.subscribe("updateTheme", (val) => {
      this.ptheme = val;
      this.visible = false;
      setTimeout(() => {
        this.ptheme = val;
        this.visible = true;
      }, 0);
    });
  }

  eventPublish(name, param) {
    this.events.publish(name, param);
  }
}
