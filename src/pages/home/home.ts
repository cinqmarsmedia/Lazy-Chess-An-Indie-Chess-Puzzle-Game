import { Component } from "@angular/core";
//import { NavController } from 'ionic-angular';
//import { StockfishService } from './../../stockfish.service';
//import { startingPos } from './../../constants';
//import * as stockfish from "../../assets/stockfish.js"
import { DeviceFeedback } from "@ionic-native/device-feedback";
import { TapticEngine } from "@ionic-native/taptic-engine";
import { LaunchReview } from "@ionic-native/launch-review";
//import { HttpClient } from '@angular/common/http';
//import { HostListener } from '@angular/core';

import { Storage } from "@ionic/storage";
import { AngularFireDatabase } from "angularfire2/database";
import * as Chess from "../../assets/js/chess.js";
import { AlertController, Platform, LoadingController } from "ionic-angular";
import _ from "lodash";

import { Events } from "ionic-angular";
import { MenuController } from "ionic-angular";

import { base64Pieces } from "./../../constants";
import { themes } from "./../../constants";
import { emailDomainBlacklist} from "./../../constants";
import { openings } from "./../../constants";
//import validate from 'deep-email-validator' 

declare const admob;

const iapID = "<iap ID>";

const admobIDInter = {
  android: "<adMob Intersitial ID Android>",
  ios: "<adMob Intersitial ID iOS>",
};
const admobIDReward = {
  android: "<adMob ID Android>",
  ios: "<adMob ID Android>",
};

const starThreshold = 30;
const starMilestones = [90, 80, 70, 60, 50, 40, 30, 20, 10, 5, 3, 1.1];

const modeDesc={
"bestRand":["Best + Random Mode","In this mode one of your options will be your best move according to stockfish, and your other moves will be random. A great introductory mode, deceptively easy, where one blunder will likely cost you victory. The AI also improves in this mode."],
"shallow":["Shallow Mode","Stockfish is reduced to its shallowest depth and things get frenzied. A good simulation of blitz sensibilities, your moves won't be as refined and neither will your opponents."],
"allRand":["Random Mode","In this mode, stockfish is turned off and all your move choices are random. The game transforms into being about choosing the \"least worst\" move rather than the better of your two best. We are hard at work adding this feature, it will be available in a free update shortly. <b>Sign up for our newsletter to be notified and to earn a star!</b>"],
"twobytwo":["2 x 2 Mode","A unique challenge where each player takes two moves in succession, one for themselves and another for their opponent. <b>Sign up for our newsletter to be notified and to earn a star!</b>"],
"pieceFocus":["By Piece Mode","In this mode, you toggle between all the possible moves of a single piece stockfish chooses. We are hard at work adding this feature, it will be available in a free update shortly. <b>Sign up for our newsletter to be notified and to earn a star!</b>"],
"bothSides":["Both Sides Mode","An extremely fun and challenging mode where you play as both white and black. As white you are trying to defeat black but blacks moves are much better. This mode does not work in online multiplayer"],
"swipe":["Swipe Mode","Originally conceived as a standalone game, swipe mode lets you swipe in one of the eight cardinal or intermediate directions to move ALL chess pieces that can move in that direction on your turn. We are hard at work adding this feature, it will be available in a free update shortly. <b>Sign up for our newsletter to be notified and to earn a star!</b>"]
}

const offlineProjects = [
  {
    title: "The Devil's Calculator",
    button: "Download Free",
    iOS:
      "https://itunes.apple.com/us/app/the-devils-calculator/id1447599858?ls=1&mt=8",
    android:
      "https://play.google.com/store/apps/details?id=com.cinqmarsmedia.devilscalc",
    icon: "dc",
    description:
      "An educational math puzzle game named one of the 10 best indies of 2019 by PAX",
  },

  {
    title: "Anagraphs",
    button: "Download Free",
    iOS: this.anagraphsiOS,
    android: this.anagraphsAndroid,
    icon: "anagraphs",
    description: "A free new linguistic puzzle game by the creator of Synonymy",
  },

  {
    title: "PolitiTruth",
    button: "Download Free",
    iOS: "https://apps.apple.com/us/app/polititruth/id1217091559?ls=1",
    android:
      "https://play.google.com/store/apps/details?id=com.cinqmarsmedia.polititruth",
    icon: "polititruth",
    description:
      "a free, non-profit fake news quiz game sponsored by PolitiFact",
  },

  {
    title: "The Birds Upstairs",
    button: "Watch",
    iOS: "https://www.youtube.com/embed/2rI_em4MscE?rel=0&autoplay=1",
    android: "https://www.youtube.com/embed/2rI_em4MscE?rel=0&autoplay=1",
    icon: "birds",
    description: "An award winning student oscar nominated short film",
  },

  {
    title: "Word Unknown",
    button: "Download Free",
    iOS:
      "https://itunes.apple.com/us/app/word-unknown/id1064901570?mt=8&ign-mpt=uo%3D4",
    android:
      "https://play.google.com/store/apps/details?id=com.jarvisfilms.wordunknown",
    icon: "wordunknown",
    description: "An intelligent mix of hangman and Mastermind®",
  },
  //
  {
    title: "Synonymy",
    button: "Download Free",
    iOS: "https://apps.apple.com/us/app/synonymy/id924648807?ls=1",
    android:
      "https://play.google.com/store/apps/details?id=air.com.jarvisfilms.synonomy",
    icon: "syn",
    description: "An educational word game narrated by Richard Dawkins",
  },
];

const numConvert = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
};

//const intervalTime = 100;

const newGameFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
//const newGameFEN ='7k/8/8/8/R7/1R6/8/1K6 w - - 0 1'

//const newGameFEN ='8/p7/K6k/7P/8/8/8/8 w - - 0 1'
//const newGameFEN = "8/1P1P2pp/8/4Pp2/2P5/7k/P7/1K6 w - - 0 1";
//const newGameFEN = "4q1k1/p4b2/2pN3p/2pn1pp1/P7/1P1P1N1P/2P2PP1/3Q2K1 w - - 0 1";

const thresh:any = [
  null, // unlock challenge
  "friendPlay",
  "kosal",
  "frozen",
  "3",
  null,
  "bias",
  //"1700",
  "merida",
  "bestRand",
  null,
  "local",
  "lime",
  "pgn",
  //"200",
  null,
  "randOpp",
  "4",
  null,
  "oslo",
  "shallow",
  "leipzig",
  null,
  "depth",
  //"4700",
  "california",
  null,
  "chess24",
  "allRand",
  "pieceFocus"
  //"0" RANDOM MODE
]; //{ alpha: 100, kosal: 75, merida: 50, oslo: 25 };

const whiteOpenings=["e2e4","d2d4","c2c4","g1f3"];
// const goodWhiteOpenings=[""] // one from each? then concat

@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {

handleKeyboardEvent(event: KeyboardEvent) {
if (event.key=="Tab" || event.key=="a" || event.key=="w" || event.key.slice(0,5)=="Arrow"){
this.prevToggle();
}

if (event.key=="Enter" || event.key=="Space"){
this.makeMove();
}
if (event.key=="m" || event.key=="M"){
if(this.menuCtrl.isOpen()){
this.menuCtrl.close();
}else{
  this.menuCtrl.open();
}
}

if (event.key=="1"){
this.cp();
}
if (event.key=="2"){
this.dpth()
}
if (event.key=="3"){
this.hdnicp()
}
if (event.key=="4"){
this.history();
}
if (event.key=="s" || event.key=="S"){
this.showStats();
}
if (event.key=="Backspace" || event.key=="Delete"){
this.abandonGame(true);
}

if (event.key=="T" || event.key=="t"){
this.openLink('https://www.twitch.tv/cinqmarsmedia/')
}
if (event.key=="D" || event.key=="d"){
this.openLink('https://discord.com/invite/fwkMQCnk2R')
}

    }
  //debugMode: any = true;
  steam:any=true; // set to false for mobile!!!!!!!!!!!!!
  currOpening:any={w:null,b:null}
  mode:any="nBest"
  wait: any = false;
  moveHistory:any=[];
  numChoices: any = 2;
  delayTime: any = 700;
  Math: any = Math;
  wideview:any=false;
  goodMoji: any = ["😄", "😊", "👍", "🤓", "👑"];
  badMoji: any = ["😬", "🧐", "🥺", "🤦‍♂️", "😧"];
  randNum: any = Math.floor(Math.random() * 50);
  flashTimeout: any;
  //gameMoves:any=0;
  theme: any = "alpha";
  position: any;
  flashResult: any = false;
  game: any;
  percent: any = 99;
  anagraphsiOS: any = "https://cinqmarsmedia.com/anagraphs";
  anagraphsAndroid: any = "https://cinqmarsmedia.com/anagraphs";
  centipawns:any=0;
  colorBlackAI:any=false;
  currDepth: any = 0;
  handicap:any=0;
  highlighted:any=0;
  //percentile:any=0;
  numChoicesTxt: any = numConvert[this.numChoices];
  thinking: boolean = false;
  thinkingTimer: boolean = false; //is true when the app is thinking, but turns false when the thinking time is over. Is a fallback if the chess engine takes too long to compute.
  thinkingTimeout:any; //the actual timeout
  placeholder: any;

  //userTurn: any = true;
  //AIlevel: any = { depth: 20, chance: 30 }; //4.2% of the time random
  tapPrompt: any = false;
  _fbSubRanking;
  _fbSubGame;
  _queueSub;
  _challSub;
  onPauseSubscription: any;
  newsletterSigned:any=false;
  //onResumeSubscription: any;
  username: any = "";
  whiteBottom: any = true;
  stockfish: any;
  //AI: any = {};
  choices: any = [null, null, null, null];
  selected: any;
  finalChoices: any = [1];
  lastchoice: any = { move: null, rank: null };
  prompt: any = true;
  waitMove = false;
  numGames: any = 0;
  gameType: any = "ai"; //ai,local,firebase
  playersTurn: any = true;
  rematchWindow: any;
  awaitingRematch: any = false;
  alertWindow: any;
  playerOne: any = true;
  countdownTimer: any;
  timerVal: any = 0;
  helpTimer: any;
  stockfishWhite: any = false;
  reviewed: any = false;
  pieceImages: any = base64Pieces[this.theme];
  supressAds: any = true;
  adPromptCounter: any = -5;
  adPromptThreshold = 60;
  record: any = {
    best: 0,
    worst: 0,
    total: 0,
    totalChoices: 0,
    wins: 0,
    losses: 0,
    handicap:0,
    modeTotals:{bestRand:0,shallow:0,allRand:0,pieceFocus:0,swipe:0}
  };
  newboardgamestate:any=true;
  elo:any;
  difficultyBias: any = 0;
  repair: any = false;
  mobile: any;
  iOS: any = navigator.userAgent.match(/Mac|iPhone|iPad|iPod/i);
  bestPercent: any = 99;
  boardVisable: any = true;
  storedFEN: any = null;
  stars: any=0;
  alertBox:any;
  color: any = "default";
  usePersonalisedAds: boolean = false;
  shownConsent: any = false;
  offlineAdIndex: any = 0;
  attemptedChallenges: any = []; // names of levels
  challengeDB: any = [];
  challengeUpdated: any = 0;
  //AISkill: number = 0; //skill level for AI Moves 0-20
  /**/
  loadingPop: any = this.loadingCtrl.create({
    content: "Please Wait",
    duration: 3000,
  });

  constructor(
    //private admobpro: AdMobPro,
    private alertCtrl: AlertController,
    public db: AngularFireDatabase,
    public events: Events,
    public menuCtrl: MenuController,
    public storage: Storage,
    public platform: Platform,
    public deviceFeedback: DeviceFeedback,
    public taptic: TapticEngine,
    public launchReview: LaunchReview,
    public loadingCtrl: LoadingController
  ) {

    platform.ready().then(() => {
      this.setAnagraphsURL();
      if (window["cordova"] && window["cordova"].InAppBrowser) {
        window["open2"] = window["cordova"].InAppBrowser.open;
      }else{
        window["open2"]=window.open;
      }
      // this.startTimeout();
      if (this.platform.is("cordova")) {
        window["store"].register({
          id: iapID,
          type: window["store"].NON_CONSUMABLE,
        });

        window["store"].refresh();

        window["store"].when(iapID).approved((p) => {
          this.stars = starThreshold;
          this.events.publish("30stars");
          this.loadingPop.dismiss();
          this.thankyou();
          this.setData();
          p.finish();
        });

        window["store"].when(iapID).owned(() => {
          let p = window["store"].get(iapID);
          console.log(p.owned);
          if (p.owned && this.stars < starThreshold) {
            this.stars = starThreshold;
            this.events.publish("30stars");
          }

          this.loadingPop.dismiss();
        });
      }
    });

    document.addEventListener("admob.reward_video.reward", () => {
      //console.log("reward vid successfully completed");
      this.loadingPop.dismiss();
      this.earnedUpgrade(false);
    });

    document.addEventListener("admob.reward_video.load_fail", () => {
      this.loadingPop.dismiss();
      this.videoFailed();
      // show something
    });

    this.pieceTheme = this.pieceTheme.bind(this);

    if (this.platform.is("cordova")) {
      this.mobile = true;
    } else {
      this.mobile = false;
      this.stars=starThreshold;
    }

    
    /*
    this.onResumeSubscription = this.platform.resume.subscribe((result) => {
      this.syncChallenges();
    });
*/
if (!this.mobile){
this.dimensions();
      window.onresize = () => {
        this.dimensions();
    }
}

    this.onPauseSubscription = this.platform.pause.subscribe((result) => {
      this.setAnagraphsURL();
      //unsub from queue

      if (this._queueSub) {
        if (!this._queueSub.closed) {
          this._queueSub.unsubscribe();
          this.db.list("/queue").remove();
        }
      }
      this.setData();
    });

    //this.storage.set("data", {ray:'cool'}).then(()=>{})

    events.subscribe("changeColor", (val) => {
      if (thresh.indexOf(val) <= this.stars) {
        this.changeThemeColor(val);
        //this.color = val;
        //this.pieceImages = base64Pieces[this.theme];
        //this.boardVisable = false;

        this.menuCtrl.close();
        this.setData();
      } else {
        //this.events.publish("updateColor", this.color);
        this.starPrompt(val);
      }
    });


events.subscribe("mode", (val) => {

  var available=thresh.includes(val) || val=='nBest'



if (available){

if (thresh.indexOf(val) > this.stars && val!=='nBest') {
        this.starPrompt(val);
        setTimeout(()=>{this.events.publish("updateMode", this.mode);},0)
}else{

if (this.record.modeTotals[val]==0 && val!=='nBest'){
this.pop(modeDesc[val][0],modeDesc[val][1]);
}

this.mode=val;
this.setData();
}


}else{
this.popNews(modeDesc[val][0],modeDesc[val][1])
setTimeout(()=>{this.events.publish("updateMode", this.mode);},0)
}




this.menuCtrl.close();
})
    events.subscribe("changeTheme", (val) => {
      // go by num stars
      if (thresh.indexOf(val) <= this.stars) {
        this.theme = val;
        this.pieceImages = base64Pieces[this.theme];
        this.boardVisable = false;
        setTimeout(() => {
          this.boardVisable = true;
        }, 0);
        this.menuCtrl.close();
        this.setData();
      } else {
        this.events.publish("updateTheme", this.theme);

        this.starPrompt(val);
      }
    });

    events.subscribe("resetData", (val) => {
      // ()() preserve in-app purchases (stars);
      var alert = this.alertCtrl.create({
        title: "Reset ALL Data?",
        enableBackdropDismiss: true,
        subTitle: "The game will be fully reset including stars earned from watching ads or hitting milestones. Stars from donations will be preserved. <b>This cannot be undone.</b>",
        //message: "Are you sure you want to quit?",
        buttons: [
          {
            text: "cancel",
          },
          {
            text: "Yes",
            handler: (data) => {
              var temp = this.stars;
              if (temp<starThreshold){
                temp=0;
              }
              this.storage.clear().then(() => {
                this.storage.set("lazyChessData", { stars: temp }).then(() => {
                  window.location.reload(true);
                });
              });
            },
          },
        ],
      });

      alert.present();
    });

    events.subscribe("thinktime", (val) => {
      if (thresh.indexOf(val) > this.stars) {
        this.starPrompt(val);
      } else {
        if (val == "0") {
          this.abandonGame(true, "ai");
          //this.asyncChoices();
        }

        this.delayTime = val;
      }

      this.menuCtrl.close();
    });

    events.subscribe("stats", (val) => {
      this.showStats();
    });

    events.subscribe("code", (val) => {

      if (this.iOS && this.mobile) {
        //this.starPrompt("upgrade");
        this.restorePurchase();
      } else {
        this.codeInput();
      }
    });
    events.subscribe("devil", (val) => {
      if (this.iOS) {
        this.openLink("https://itunes.apple.com/app/id1447599858")
    
      } else if (navigator.userAgent.match(/Android/i)) {
     this.openLink("https://play.google.com/store/apps/details?id=com.cinqmarsmedia.devilscalc");
      }else{
this.openLink("https://www.cinqmarsmedia.com/devilscalculator/")
      }
    });

    events.subscribe("anagraphs", (val) => {
      if (this.iOS) {
        this.openLink(this.anagraphsiOS)
      } else if (navigator.userAgent.match(/Android/i)){
        this.openLink(this.anagraphsAndroid);
      }else{
      this.openLink("https://cinqmarsmedia.com/anagraphs");
      }
    });

    events.subscribe("openCMM", (val) => {
      //this.showInterAd()
      this.openLink("https://cinqmarsmedia.com");
    });

    events.subscribe("upgrade", (val) => {
      //this.showInterAd()
      this.starPrompt("upgrade");
    });

    events.subscribe("challengePrompt", (val) => {
      this.challengesPrompt();
    });

    events.subscribe("pauseAds", (val) => {
      this.adPrompt();
    });

    events.subscribe("difficulty", (val) => {
      if (thresh.indexOf(val) > this.stars) {
        setTimeout(() => {
          this.events.publish("updateDifficulty", this.numChoices);
        }, 0);

       // console.log(this.numChoices);
        this.starPrompt(val);
      } else {
        if (this.numChoices !== val) {
          this.abandonGame(true, "ai", val);
        }
      }
      this.menuCtrl.close();
    });

    events.subscribe("abandon", (val) => {
      this.abandonGame(true);
      //this.fixCorruption();
      this.menuCtrl.close();
    });

    events.subscribe("guide", (val) => {
      this.guide();
    })

    events.subscribe("playFriend", (val) => {

  if (thresh.indexOf("friendPlay") > this.stars) {
        this.starPrompt("friendPlay");
      } else {
   if (!window.navigator.onLine) {
        this.noInternet();
        return;
      }
      this.abandonGame(this.gameType !== "ai", "firebase");
      this.playOnline(false);
      }

      this.menuCtrl.close();
    });

    events.subscribe("randOpp", (val) => {
      if (thresh.indexOf("randOpp") > this.stars) {
        this.starPrompt("randOpp");
      } else {
        this.abandonGame(this.gameType !== "ai", "firebase");
        this.playRandom();
      }
      this.menuCtrl.close();
    });

    events.subscribe("local", (val) => {
      if (thresh.indexOf("local") > this.stars) {
        this.starPrompt("local");
      } else {
        this.abandonGame(this.gameType !== "ai", "local");
      }
      this.menuCtrl.close();
    });

    // deviceID / userID

    // FIREBASE EXAMPLE ------------
    //this.db.list('/database/tfdjk').push(Math.random())

    //this.db.list('/database').remove()

    // console.log(this.db);
    //---------------------------------

    //this.clearAI();

  }

dimensions() {
var ratio = window.innerWidth / window.innerHeight;
this.wideview=ratio>8/7 && window.innerWidth>730;
  }

guide(){
if (!window.navigator.onLine){
this.noInternet();
  return;
}
this.openLink("https://www.cinqmarsmedia.com/lazychess/guide/")
}
  codeInput() {
    /**/
    if (this.iOS && this.mobile) {
      return;
    }

    var message =
      "Our non-profit makes our games freely available to academic institutions.";

    var prompt = this.alertCtrl.create({
      title: "Enter Academic Code",

      message: message,
      inputs: [
        {
          name: "code",
          placeholder: "L5X13QFS",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          handler: (data) => {},
        },
        {
          text: "Enter",
          handler: (data) => {
            if (this.secretCode(data.code, false)) {
              if (this.stars >= 20) {
                prompt.setMessage(
                  message +
                    '<br><span class="red">Full Game Already Unlocked</span>'
                );
              }

              //this.result="EDU Unlock"
              return true;
            } else {
              prompt.setMessage(
                message +
                  '<br><span class="red">Code Incorrect. Contact info@cinqmarsmedia.com to request a code</span>'
              );
              return false;
            }
          },
        },
      ],
    });
    prompt.present();
  }

  challengesPrompt(page: any = 1) {
    //this.challengeDB;
    //this.challengeDB=[{name:'The Queen\'s Gambit',fen:'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1',message:'<img class="challengeImg" align="right" src="https://cinqmarsmedia.com/lazychess/challengeImages/headshot.jpg"> Your opponent has fallen for the imfamous Queen\'s Gambit. Can you make them pay?'},{name:'The Lucena',fen:'1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',message:'One of the most common rook-pawn endgames in chess, the lucena Magnus Carlson is a grandmaster. He chose the queens gabit as a challenge because it was a thing that was a thing <img src="picture"> you can follow magnus on twitch <a href="url">here</a>'}];

    // BOLD IF UNBEATEN //checkmark?
    //var challenges=['1','2','3','4','5','6','7','8','9','10','11','12','13','14'];

    var buttons: any = [];

    this.challengeDB.forEach((chall, i) => {
      var newchall = !this.attemptedChallenges.includes(chall.name);

      buttons.push({
        text: (newchall ? "● " : "") + chall.name,
        cssClass: newchall ? "challengeButtonNew" : "challengeButton",
        handler: () => {
          //var numChallUnlocked=0;
          var challs = 0;
          var req;

          for (let x = 0; x < starThreshold; x++) {
            if (!thresh[x]) {
              challs++;
              if (challs == i + 1) {
                req = x + 1;
                break;
              }
            }
          }

          //console.log(req);

          if (this.stars < req && newchall) {
            this.openStarPrompt(req);
          } else {
            this.abandonGame(true, "ai", false, chall);
          }
        },
      });
    });
    //buttons=buttons.reverse()
    buttons.push(
      {
        text: "Cancel",
        handler: (data) => {},
      }
      // a "more" button? Like another page?
    );

    var alert = this.alertCtrl.create({
      // title: "Full Game Unlocked",
      //subTitle: 'wowowow',
      // message: test,
      cssClass: "challengePrompt",
      buttons: buttons,
    });
    alert.present();
  }

  thankyou() {
    var alert = this.alertCtrl.create({
      title: "Full Game Unlocked",
      //subTitle: 'wowowow',
      message: "Thank you for your donation! As a non-profit, we rely on your support and are incredibly grateful for it. Please keep in touch with our organization and get updates on all our new projects by signing up for our newsletter below.",

      buttons: [
        {
          text: "No Thanks",
          handler: (data) => {},
        },
        {
          text: "Ok!",
          handler: () => {
            this.newsletterPop();
          }
    }
      ],
    });
    alert.present();
  }

  setAnagraphsURL() {
    if (!this.anagraphsiOS.includes("cinqmarsmedia")) {
      return;
    }
    if (new Date().getTime() > 1617696000000) {
      this.anagraphsiOS = "https://itunes.apple.com/app/id1537359369";
      this.anagraphsAndroid =
        "https://play.google.com/store/apps/details?id=com.cinqmarsmedia.anagraphs";
    }
  }

  keyboardShortcuts(){
   var alert = this.alertCtrl.create({
      title: "Keyboard Shortcuts",
      message: "commit move: <b>space or enter</b><br>toggle moves: <b>tab or arrow keys</b><br>forfeit: <b>delete or backspace</b><br><br>Menu: <b>m</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Stats: <b>s</b><br>Advantage: <b>1</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Depth: <b>2</b><br>AI Bias: <b>3</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; History: <b>4</b><br>Twitch: <b>t</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Discord: <b>d</b>",
      buttons: [
        {
          text: "Ok",
          handler: (data) => {},
        },
      ],
    });
    alert.present();
  }

  getCodes(quick) {
    var now: any = new Date();
    //var tomorrow:any = new Date();
    //tomorrow.setDate(now.getDate()+1);

    var expiry;
    var cnst;
    var mult;

    if (quick) {
      expiry = 1800000;
      mult = 14;
      cnst = 52;
    } else {
      expiry = 79200000;
      mult = 9;
      cnst = 32;
    }

    var expiryvalue = Math.floor(now.getTime() / expiry);

    var epochDay = parseInt(String(expiryvalue).substr(2));
    var epochOne = parseInt(String(expiryvalue + 1).substr(2));
    // 3 days
    var raw = Math.pow(epochDay * mult + cnst, 3)
      .toString(36)
      .toUpperCase();

    var rawone = Math.pow(epochOne * mult + cnst, 3)
      .toString(36)
      .toUpperCase();
    /*
raw=raw.substr(raw.length - 8);
rawtom=rawtom.substr(rawtom.length - 8);
*/
    return [raw, rawone];
  }

  syncChallenges() {
    //console.log('hello');
    if (new Date().getTime() - this.challengeUpdated < 36400000) {
      return;
    }
    this._challSub = this.db
      .list("/challenges")
      .valueChanges()
      .subscribe((data) => {
        console.log(data);
        this.challengeDB = data;
        this.updateChallCount();
        this.challengeUpdated = new Date().getTime();
        this.setData();
        this._challSub.unsubscribe();
      });
  }

  updateChallCount(canonlybebigger: any = true) {
    var newchalls = 0;

    this.challengeDB.forEach((chall) => {
      if (!this.attemptedChallenges.includes(chall.name)) {
        newchalls++;
      }
    });
    if (newchalls > 0 || !canonlybebigger) {
      this.events.publish("updateChallenges", newchalls);
    }
  }
  secretCode(code, quickexpiry) {
    var realCodes = this.getCodes(quickexpiry);

    if (code == realCodes[0] || code == realCodes[1]) {
      this.stars = starThreshold;
      this.setData();

      this.alertCtrl.create({
        title: "Full Game Successfully Unlocked",
        buttons: [
          {
            text: "Ok",
            handler: (data) => {},
          },
        ],
      });
      this.prompt.present();

      return true;
    } else {
      return false;
    }

  }

  arrayN(int) {
    return Array(int);
  }

  fixCorruption() {
    console.error("DISASTER, WHY is this happening????????");
    /*
     let store={username:this.username,supressAds:this.supressAds,adPromptCounter:this.adPromptCounter,record:this.record,adPromptThreshold:this.adPromptThreshold,theme:this.theme,bestPercent:this.bestPercent,storedFEN:this.game.fen()}

    this.storage.set("lazyChessData", store).then(()=>{
     window.location.reload();
    });
*/
  }

  corrupted = _.throttle(this.fixCorruption.bind(this), 5000);

  pieceTheme(piece: string): string {
    // console.log(piece);
    if (!piece) {
      return "";
    }

    return "data:image/svg+xml;base64," + base64Pieces[this.theme][piece];
  }

  changeThemeColor(val) {
    //console.log(val, themes);
    let root = document.documentElement;

    root.style.setProperty(
      "--Black",
      "rgb(" +
        themes[val].black[0] +
        "," +
        themes[val].black[1] +
        "," +
        themes[val].black[2] +
        ")"
    );

    root.style.setProperty(
      "--White",
      "rgb(" +
        themes[val].white[0] +
        "," +
        themes[val].white[1] +
        "," +
        themes[val].white[2] +
        ")"
    );
    this.color = val;
    this.events.publish("updateColor", this.color);
    this.setData();
  }

  starPrompt(val: any = "") {
    if (this.stars >= starThreshold) {
      this.thankyou();
      return;
    }

    if (!this.shownConsent && this.platform.is("cordova")) {
      this.showConsents();
      this.openStarPrompt(thresh.indexOf(val) + 1);
    } else {
      this.openStarPrompt(thresh.indexOf(val) + 1);
    }
  }

  restorePurchase() {
    if (this.platform.is("cordova")) {
      window["store"].refresh();
    }
  }

  openStarPrompt(val) {
    var title;

    if (val > 0) {
      title = "Feature Requires " + val + " Star" + (val > 1 ? "s" : "");
    } else {
      title = "Earn More Stars";
    }
    if (val == "upgrade" && this.platform.is("cordova")) {
      window["store"].refresh();
    }

    var alert = this.alertCtrl.create({
      title: title,
      message:
        "You currently have <b>" +
        this.stars +
        "</b> star" +
        (this.stars !== 1 ? "s" : ""),
      enableBackdropDismiss: false,
      subTitle:
        "Earn stars by hitting milestones or by watching a quick video. Reach <b>" +
        starThreshold +
        "</b> stars or make a one time donation to unlock every feature and suppresses all advertisements.",
      //message: "Are you sure you want to quit?",
      buttons: [
        {
          text: "No Thanks",
          handler: (data) => {},
        },
        {
          text: "Watch Video for 1 star",
          handler: (data) => {
            if (window.navigator.onLine) {
              this.showRewardAd();
            } else {
              this.noInternet();
            }
          },
        },
        {
          text: "Donate",
          handler: (data) => {
            if (window.navigator.onLine) {
              if (this.mobile) {
                this.loadingPop.present();
                window["store"].order(iapID);
              } else {
                this.stars = starThreshold;
                this.events.publish("30stars");
              }
            } else {
              this.noInternet();
            }
            // this.loadingPop.present();
          },
        },
      ],
    });

    // var alert = this.alertCtrl.create({
    //   title: title,
    //   message:
    //     "You currently have <b>" +
    //     this.stars +
    //     "</b> star" +
    //     (this.stars !== 1 ? "s" : ""),
    //   enableBackdropDismiss: false,
    //   subTitle:
    //     "Earn stars by hitting milestones or by supporting our non-profit by watching a quick video. Reaching 30 stars or a one time upgrade unlocks every feature and suppresses all advertisements.",
    //   //message: "Are you sure you want to quit?",
    //   buttons: [
    //     {
    //       text: "No Thanks",
    //       handler: (data) => {},
    //     },
    //     {
    //       text: "Watch Video for 1 star",
    //       handler: (data) => {
    //         // after callback
    //         this.showRewardAd();
    //       },
    //     },
    //     {
    //       text: "Upgrade",
    //       handler: (data) => {},
    //     },
    //   ],
    // });

    alert.present();
  }

  noInternet() {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false,
    });
    alert.setTitle("Please Connect to Internet");
    alert.setMessage(
      "You must have an internet connection to use this feature"
    );

    alert.addButton({
      text: "Ok",
      handler: (data) => {},
    });

    alert.present();
  }

  ionViewCanEnter(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get("<localStorageVariable>").then((val) => {
        //console.log(val);
        if (val) {
          if (val.username) {
            this.username = val.username;
            this.theme = val.theme;
            this.record = val.record;
            this.reviewed = val.reviewed;
            this.bestPercent = val.bestPercent;
            this.storedFEN = val.storedFEN;
            this.shownConsent = val.shownConsent;
            this.offlineAdIndex = val.offlineAdIndex;
            this.attemptedChallenges = val.attemptedChallenges;
            this.challengeDB = val.challengeDB;
            this.challengeUpdated = val.challengeUpdated;
            if (this.stars < val.stars) {
              this.stars = val.stars;
            }
          
            this.percent = this.percentile();
            this.elo=this.calcELO();
            this.color = val.color;
            this.updateChallCount();

// updated variables in new versions
  if (val.handicap){
    this.handicap=val.handicap
  }

if (!val.newsletterSigned){this.newsletterSigned=false}else{
  this.newsletterSigned=val.newsletterSigned;
}
if (!val.mode){this.mode="nBest"}else{
  this.mode=val.mode
this.events.publish("updateMode", this.mode);
}

if (!val.numChoices){
  this.numChoices=2;
}else{
  this.numChoices=val.numChoices;
this.events.publish("updateDifficulty", this.numChoices);
}

if (!val.moveHistory){
  this.moveHistory=[];
}else{
  this.moveHistory=val.moveHistory;
}


if (!val.record.handicap){this.record.handicap=0}else{this.record.handicap=val.record.handicap}
if (!val.record.modeTotals){
  this.record.modeTotals={bestRand:0,allRand:0,pieceFocus:0,swipe:0}
}else{

this.record.modeTotals=val.record.modeTotals;
  if (!val.record.modeTotals.shallow){
this.record.modeTotals.shallow=0;
  }
  if (!val.record.modeTotals.twobytwo){
this.record.modeTotals.twobytwo=0;
  }

  if (!val.record.modeTotals.bothSides){
this.record.modeTotals.bothSides=0;
  }
  
}


          } else if (val.stars) {
            if (this.stars < val.stars) {
              this.stars = val.stars;
            }
          }
        }

        this.syncChallenges();
        if (this.stars >= starThreshold) {
          this.shownConsent = true;
          this.events.publish("30stars");
        }

        if (this.username == "") {
          this.username = this.genUID();
          this.setData();
        }

        if (this.theme !== "alpha") {
          this.pieceImages = base64Pieces[this.theme];
          this.events.publish("updateTheme", this.theme);
        }

        if (this.color !== "default") {
          this.changeThemeColor(this.color);
        }

        //this.pieceImages=;

        //console.log(this.pieceImages);
        /*
if (!this.supressAds && this.mobile){
this.admobpro.hideBanner();
}
*/

        //this.bannerAds()

        resolve(true);
        /*
 this._fbSubRanking = this.db.list('/users/'+this.genUID()).valueChanges().subscribe(data => {
        console.log(data);


        resolve(true);

      })
*/
      });
    });
  }

  ionViewWillEnter() {
    //this.storedFEN=null
    this.initStockfish();
    this.newGame();
  }


  /*  */

  apticCall(type: any = 3) {
    if (this.mobile) {
      setTimeout(() => {
        this.deviceFeedback.haptic(type);
        this.taptic.selection();
      }, 0);
    }
  }

  ionViewWillUnload() {
    this.onPauseSubscription.unsubscribe();
    this._challSub.unsubscribe();
  }

  ngOnDestroy() {
    // always unsubscribe your subscriptions to prevent leaks
    //this._fbSubRanking.unsubscribe();

    this._fbSubGame.unsubscribe();
    this._queueSub.unsubscribe();
  }
  // this.supressAds=val.supressAds;    this.adPromptCounter=val.adPromptCounter;

  setData() {
    //let store = this.wrapVariables();
    let store = {
      username: this.username,
      supressAds: this.supressAds,
      adPromptCounter: this.adPromptCounter,
      record: this.record,
      adPromptThreshold: this.adPromptThreshold,
      theme: this.theme,
      bestPercent: this.bestPercent,
      stars: this.stars,
      color: this.color,
      numChoices: this.numChoices,
      handicap: this.handicap,
      consent: this.shownConsent,
      offlineAdIndex: this.offlineAdIndex,
      attemptedChallenges: this.attemptedChallenges,
      challengeDB: this.challengeDB,
      challengeUpdated: this.challengeUpdated,
      mode:this.mode,
      newsletterSigned:this.newsletterSigned,
      storedFEN:this.storedFEN,
      moveHistory:this.moveHistory
    };
    this.storage.set("<localStorageVar>", store);
  }

  wrapVariables() {
    var persist = ["position", "choices"];

    let state = {};

    persist.forEach((prop) => {
      state[prop] = this[prop];
    });

    return state;
  }

  unwrapVariables(state) {
    for (var prop in state) {
      this[prop] = state[prop];
    }
  }

  genUID(num: any = 30) {
    return Math.random().toString(36).substr(2, num);
  }

  ionViewWillLeave() {
    this._fbSubGame.unsubscribe();
    //this._fbSubRanking.unsubscribe();
  }

  abandonGame(
    prompt: any = false,
    gameType: any = "ai",
    setMoves: any = false,
    gameobj: any = { fen: newGameFEN },
    colorBlack:any=false
  ) {
    // how to do this?

    if (
      prompt &&
      this.gameType !== "local" &&
      !this.isNewGame() &&
      this.moveHistory.length > 1
    ) {
      var alert = this.alertCtrl.create({
        title: "Are you sure?",
        enableBackdropDismiss: false,
        subTitle: "Quitting is considered a loss",
        //message: "Are you sure you want to quit?",
        buttons: [
          {
            text: "cancel",
          },
          {
            text: "Yes",
            handler: (data) => {
              if (setMoves) {
                this.numChoices = setMoves;
              }

              if (this.gameType !== "ai") {
                this.gameConcluded(false);
              } else {
                this.updateRank(false);
                if (this.gameType == "ai"){
this.abandonGame(false,"ai",false,{ fen: newGameFEN },colorBlack)
                }else{
                  this.abandonGame(false, gameType);
                }
                
              }
            },
          },
        ],
      });

      alert.present();
    } else {
      if (setMoves) {
        this.numChoices = setMoves;
      }

      this.removeTimer();
      this.removeHighlighting("opp");
      this.removeHighlighting("player");
      this.whiteBottom = !colorBlack;
      this.playersTurn = true;
      this.stockfishWhite = colorBlack;
      this.colorBlackAI=colorBlack;
      this.storedFEN=null;

      if (this.gameType !== "ai" && this.gameType !== "local") {
        if (this._fbSubGame) {
          this.db.list(this.gameType).push("QUIT");
          //this.db.list(this.gameType).remove(); // delete
          this._fbSubGame.unsubscribe();
          //this.gameConcluded(false)
        }
        this.gameType = "ai";
      } else {
        this.gameType = gameType;
      }

      if (this.gameType == "local") {
        var pass = this.alertCtrl.create({
          title: "Pass & Play",
          enableBackdropDismiss: false,
          subTitle: "Player One should prepare to make their opening move",
          buttons: [
            {
              text: "Ready",
              handler: (data) => {},
            },
          ],
        });

        pass.present();
      }
      this.setData();
      this.thinking = true;
      this.initStockfish();

      if (gameobj.color){
        this.colorBlackAI=(gameobj.color=='black');
      }

      this.newGame(gameobj.fen);

      if (typeof gameobj.name !== "undefined") {
        this.loadChallenge(gameobj);
      }

      if (this.gameType == "online") {
        this.playRandom();
      }
      this.menuCtrl.close();
    }
  }

  loadChallenge(chall) {
    var alert = this.alertCtrl.create({
      title: chall.name,
      cssClass: "challengeInfo",
      //subTitle: 'wowowow',
      message: chall.message,

      buttons: [
        {
          text: "Ok",
          handler: (data) => {},
        },
      ],
    });
    if (!this.attemptedChallenges.includes(chall.name)) {
      this.attemptedChallenges.push(chall.name);
      this.updateChallCount(false);
    }
    this.setData();
    alert.present();
  }

  adPrompt(warn = false) {
    var adAlert = this.alertCtrl.create({
      title: "Non-Profit Mission",
      enableBackdropDismiss: false,
      subTitle: "Support our Educational Non-Profit",
      message:
        "By watching a quick video, you can support our 501(c)3 and have all other ads removed for 100 moves. This stacks if you watch multiple videos!",
      buttons: [
        {
          text: "No Thanks",
          handler: (data) => {
            if (warn) {
              this.supressAds = false;
              //console.log(this.supressAds);
              //this.bannerAds();
              //this.admobpro.showBanner(this.admobpro.AD_POSITION.BOTTOM_CENTER);
              this.setData();
            } else {
              this.adPromptThreshold = this.adPromptThreshold * 2;
            }
          },
        },
        {
          text: "Watch Video",
          handler: (data) => {
            this.showRewardAd();
          },
        },
      ],
    });

    adAlert.present();
  }

  updateRank(won) {
    this.showInterAd();

    if (this.gameType == "local") {
      return;
    }
    if (won) {
      this.record.wins++;
    } else {
      this.record.losses++;
    }

    this.percent = this.percentile();
this.elo=this.calcELO();
    if (this.percent < this.bestPercent) {
      for (let i = 0; i < starMilestones.length; i++) {
        if (
          this.percent <= starMilestones[i] &&
          this.bestPercent > starMilestones[i]
        ) {
          this.bestPercent = starMilestones[i];
          this.earnedUpgrade(Math.floor(starMilestones[i]));
          break;
        }
      }

      this.syncChallenges();
     
    }
  }

  unlockChallenge(earned, indx) {
    var pre;
    if (earned) {
      pre =
        "You completed a game in the top <b>" +
        earned +
        "%</b> of all players worldwide and";
    } else {
      pre = "You";
    }

    let alert = this.alertCtrl.create({
      title: "Congratulations!",
      message:
        pre +
        " have earned a star. A new challenge, <b>" +
        this.challengeDB[indx].name +
        "</b> has been unlocked!",
      buttons: [
        {
          text: "Later",
          handler: () => {},
        },
        {
          text: "Play Now",
          handler: () => {
            this.abandonGame(true, "ai", false, this.challengeDB[indx]);
          },
        },
      ],
    });
    alert.present();
  }

  earnedUpgrade(earned: any = false) {
    this.stars++;
    this.setData();
    var themes: any = ["kosal", "merida", "oslo", "california"];
    var colors: any = ["frozen", "lime", "leipzig", "chess24"];


    //console.log(this.stars);
    if (this.stars < starThreshold) {
      if (!thresh[this.stars - 1]) {
        var indx = -1;

        for (let x = 0; x < this.stars; x++) {
          if (!thresh[x]) {
            indx++;
          }
        }

        //this.challengeDB.length;

        if (indx > -1 && this.challengeDB[indx]) {
          this.unlockChallenge(earned, indx);
        } else {
          this.earnedStar(earned);
        }
      } else {
        if (themes.includes(thresh[this.stars - 1])) {
          this.upgradePiece(thresh[this.stars - 1], earned);
        } else if (colors.includes(thresh[this.stars - 1])) {
          this.upgradeColor(thresh[this.stars - 1], earned);
        } else {
          // new feature
          this.upgradeFeature(thresh[this.stars - 1], earned);
        }
      }
    }
  }

  videoFailed() {
    let alert = this.alertCtrl.create({
      title: "Failed To Load Video",
      message: "Video Ads are not available right now, please try again later",
      buttons: [
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });

    alert.present();
  }

  earnedStar(earned: any = false) {
    var pre;
    if (earned) {
      pre =
        "You completed a game in the top <b>" +
        earned +
        "%</b> of all players worldwide and";
    } else {
      pre = "You";
    }

    let alert = this.alertCtrl.create({
      title: "Congratulations!",
      message:
        pre +
        " have earned a star. A new color theme has been unlocked. You can change back anytime using the menu",
      buttons: [
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });

    alert.present();
  }

  upgradeFeature(name, earned: any = false) {
    var features:any=["bias","pgn","depth"]
    var modes:any=["twobytwo","shallow","bestRand","allRand","pieceFocus","swipe","bothSides"]

    var pre;
    if (earned) {
      pre =
        "You completed a game in the top <b>" +
        earned +
        "%</b> of all players worldwide and";
    } else {
      pre = "You";
    }

    var post;

    if (modes.includes(name)){
post ="A brand new mode has been unlocked in the menu! Check it out!";
    }else if (features.includes(name)){

      if (name=='bias'){
post = "Custom difficulty settings have been unlocked! Tweak the AI bias by tapping the settings icon on the main screen below the board.";
      }else if(name=="pgn"){
post = "Mid-Game LiChess analysis and copying PGN history has been unlocked! Try by tapping the history icon on the main screen below the board.";
      }else{
post = "Custom think times have been unlocked! Tweak by tapping the down arrow icon on the main screen below the board.";
      }

    }else if (isNaN(parseInt(name))) {

if (name=="friendPlay"){
  post = "<b>Challenge Friends</b> has been unlocked in the menu. Invite your friends to play against you in realtime!";
}else{
      post = "A new multiplayer mode has been unlocked in the menu. Try it out!";

}

    } else if (parseInt(name) < 5) {
      post = "A new difficulty setting has been unlocked in the menu. Try it out!";
    } else {
      post = 'A new "Think Time" has been unlocked in the menu. Try it out!';
    }

    //if (){} 

    let alert = this.alertCtrl.create({
      title: "Congratulations!",
      message: pre + " have earned a star. " + post,
      buttons: [
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });

    alert.present();
  }

  upgradeColor(color, earned: any = false) {
    var pre;
    if (earned) {
      pre =
        "You completed a game in the top <b>" +
        earned +
        "%</b> of all players worldwide and";
    } else {
      pre = "You";
    }

    this.changeThemeColor(color);

    let alert = this.alertCtrl.create({
      title: "Congratulations!",
      message:
        pre +
        " have earned a star. A new color theme has been unlocked. You can change back anytime using the menu",
      buttons: [
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });
    alert.present();
  }

  upgradePiece(theme, earned: any = false) {
    this.theme = theme;
    this.pieceImages = base64Pieces[this.theme];
    this.boardVisable = false;
    setTimeout(() => {
      this.boardVisable = true;
    }, 0);

    var pre;
    if (earned) {
      pre =
        "You completed a game in the top <b>" +
        earned +
        "%</b> of all players worldwide and";
    } else {
      pre = "You";
    }

    let alert = this.alertCtrl.create({
      title: "Congratulations!",
      message:
        pre +
        " have earned a star. A new piece set has been unlocked. You can change back anytime using the menu",
      buttons: [
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });
    this.setData();
    alert.present();
  }

  removeTimer() {
    clearInterval(this.countdownTimer);
    this.timerVal = 0;
  }
  gameConcluded(won) {
    this.thinking = false;

    if (this.rematchWindow) {
      console.log(this.rematchWindow._state);
      if (this.rematchWindow._state == 3) {
        return;
      }
    }

    this.removeTimer();
    setTimeout(() => {
      this.removeTimer();
    }, 1000);
    /**/
    // if prompt is already up? catch?

    //this.showInterAd();

    this.endGamePrompt(won);
  }

  ratchetChoices(choices) {
    if (thresh.indexOf(String(choices)) > this.stars) {
      this.starPrompt(String(choices));
    } else {
      this.numChoices = choices;
      this.events.publish("updateDifficulty", choices);
    }
  }
  ratchetTime(time) {
    if (thresh.indexOf(String(time)) > this.stars) {
      this.starPrompt(String(time));
    } else {
      this.delayTime = time;
      //this.numChoices=choices;
      this.events.publish("updateThinkTime", time);
    }
  }

  ratchetDifficulty(won) {
    if (won) {

      if (this.handicap<1){
        this.handicap++
      }else if (this.numChoices == 2){
         this.ratchetChoices(3);
      }else if (this.handicap<3){
        this.handicap++
      }else if (this.numChoices==3){
        this.ratchetChoices(4);
      }else{
        this.handicap++
      }

    } else {
      if (this.handicap>3){
        this.handicap--
      }else if (this.numChoices == 4) {
        this.ratchetChoices(3);
      } else if (this.handicap>1) {
        this.handicap--
      } else if (this.numChoices == 3) {
         this.ratchetChoices(2);
      } else{
       this.handicap--
      }
    }

    setTimeout(() => {
      this.abandonGame(false, "ai");
    }, 0);
  }

  startTimeout() {
    setTimeout(() => {
      clearInterval(this.countdownTimer);
      this.timerVal = 30;
      this.countdownTimer = setInterval(() => {
        this.timerVal--;
        if (this.timerVal == 0) {
          if (this.rematchWindow) {
            // console.log(this.rematchWindow._state)
            if (this.rematchWindow._state == 3) {
              return;
            }
          }

          clearInterval(this.countdownTimer);
          if (this.playersTurn) {
            if (!this.finalChoices[this.selected] && !this.lastchoice.move) {
              this.makeMove();
            }
            this.makeMove();
          } else {
            setTimeout(() => {
              if (!this.playersTurn) {
                this.oppLeft();
              }
            }, 4000);
          }
        }
      }, 1000);
    }, 500);
  }

  oppLeft(norematch: any = true) {
    if (norematch) {
      if (this.rematchWindow) {
        // console.log(this.rematchWindow._state)
        if (this.rematchWindow._state == 3) {
          return;
        }
      }

      this.rematchWindow = this.alertCtrl.create({
        title: "Your Opponent Left", // Or not
        enableBackdropDismiss: false,
        subTitle: "Opponent Quit the Game",
        buttons: [
          {
            text: "Ok",
            handler: (data) => {
              this.db.list(this.gameType).remove();
              this._fbSubGame.unsubscribe();
              this.abandonGame(false, "online");
            },
          },
        ],
      });

      this.rematchWindow.present();
    } else {
      this._fbSubGame.unsubscribe();
      this.abandonGame(false, "ai");
    }
  }

  processData(data) {
    //console.log(data);
    var res: any = data[data.length - 1];

    if (typeof res == "string") {
      if (res == "NOREMATCH") {
        this.rematchWindow.dismiss();
        if (this.awaitingRematch) {
          this.oppLeft(true);
          this.awaitingRematch = false;
        } else {
          this.oppLeft(false);
        }
        return;
      } else if (res == "REMATCH") {
        //console.log(this.playerOne);

        if (data[data.length - 2] == "REMATCH") {
          this.playersTurn = this.playerOne;

          if (this.playerOne) {
            this.prevToggle();
          }

          setTimeout(() => {
            this.startTimeout();
            //console.log('BOBOBO'); //()()()
            this.rematchWindow.dismiss();
          }, 500);
        }
        return;
      }
    }

    var lastRematch = data.lastIndexOf("REMATCH");
    var secondToLastRematch = data.slice(0, lastRematch).lastIndexOf("REMATCH");

    if (lastRematch - secondToLastRematch == 1) {
      data = data.slice(lastRematch + 1, data.length);
      data.unshift("x", "x");
    }

    if (!this.playerOne) {
      // Player Two
      if (data.length == 0) {
        // if Player Two puts in wrong code
        this._fbSubGame.unsubscribe();
        this.friendPlay(false, true);
      }

      if (data.length == 1) {
        // confirm game for player two
        this.db.list(this.gameType).push("confirmed");
        this.whiteBottom = false;
        this.playersTurn = false;
        this.startTimeout();
      }
    } else {
      // Player One
      if (data.length == 2) {
        // game confirmed for player one
        if (this.alertWindow) {
          this.alertWindow.dismiss();
        }

        this.whiteBottom = true;
        this.playersTurn = true;
        this.startTimeout();
      }
    }
    var modulus;
    if (this.playerOne) {
      modulus = 0;
    } else {
      modulus = 1;
    }
    if (data.length > 2 && data.length % 2 == modulus) {
      this.playersTurn = true;

      if (typeof res == "string") {
        if (res.includes("checkmated")) {
          if (
            this.game.in_draw() ||
            this.game.in_stalemate() ||
            this.game.insufficient_material() ||
            this.game.in_threefold_repetition()
          ) {
            this.gameConcluded(null);
          } else {
            this.gameConcluded(true);
          }
        } else if (res == "QUIT") {
          if (this.isNewGame() || this.game.history().length < 2) {
            // unsub?
            console.log("new game oppleft");
            this.oppLeft();
          } else {
            this.gameConcluded(true); // add boolean
          }
        }
        return;
      }

      this.removeHighlighting("opp");
      this.highlightSquare(data[data.length - 1]["from"], "opp");
      this.highlightSquare(data[data.length - 1]["to"], "opp");

      this.startTimeout();

      var obj = data[data.length - 1];

      obj.promotion = "q";

      this.game.move(obj);
      var preview = new Chess(this.game.fen());
      preview.move(data[data.length - 1]);
      this.position = preview.fen();

      this.getChoices();
    }
  }

  friendPlay(create, err: any = false) {
    var code = this.genUID(5);
    var buttons = [
      {
        text: "Cancel",
        handler: (data) => {
          // console.log("ai abandon game");
          this.removeTimer();
          this.abandonGame(false, "ai");
        },
      },
    ];
    //var alertWindow

    //this.fbFriendPlay(create,code)
    if (create) {
      this.initOnlineGamePlayer(true, code, true);
    }

    if (!create) {
      buttons.push({
        text: "Enter",
        handler: (rez) => {
          this.initOnlineGamePlayer(false, rez.code);
        },
      });
    }

    var alert = {
      title: create ? code : err ? "Code Not Found" : "Input Code", // Or not
      enableBackdropDismiss: false,
      subTitle: create
        ? "Have your friend enter the above code. Once they do, a game should be automatically started"
        : err
        ? "Please check your code again"
        : "Your friend will give you an access code for the game. Enter below",
      // message: "This should be fun!",
      buttons: buttons,
    };

    if (!create) {
      alert["inputs"] = [
        {
          name: "code",
          placeholder: "a634z",
        },
      ];
    }

    this.alertWindow = this.alertCtrl.create(alert);
    this.alertWindow.present();
  }

  initOnlineGamePlayer(
    PlayerOne,
    code,
    wait: any = false,
    unshift: any = false
  ) {
    //console.log("hello world");
    this.gameType = "/onlineGames/" + code;
    if (wait) {
      this.db.list(this.gameType).push("wait");
    } else {
      this.startTimeout();
    }

    this.playerOne = PlayerOne;

    if (unshift) {
      this.whiteBottom = this.playerOne;
      this.playersTurn = this.playerOne;
    }

    this._fbSubGame = this.db
      .list(this.gameType)
      .valueChanges()
      .subscribe((data) => {
        if (unshift) {
          data.unshift("x", "x");
        }
        console.log(data);
        this.processData(data);
      });
  }

  playRandom() {
    // push user to array, as soon as array has two people, connect them?
    /**/
    // test for stars and

    if (thresh.indexOf("randOpp") > this.stars) {
      this.starPrompt("randOpp");
      return;
    } else if (!window.navigator.onLine) {
      this.noInternet();
      return;
    }

    var code = this.genUID(10) + this.username;

    this.rematchWindow = this.alertCtrl.create({
      title: "Waiting for Opponent", // Or not
      message:
        "You are first in the queue. This will timeout after <b>3 minutes</b>.",
      enableBackdropDismiss: false,
      buttons: [
        {
          text: "Cancel",
          handler: (data) => {
            this.abandonGame(false, "ai");
            this._queueSub.unsubscribe();
            this.db.list("/queue").remove();
          },
        },
      ],
    });

    this._queueSub = this.db
      .list("/queue")
      .valueChanges()
      .subscribe((data: any) => {
        console.log(data);
        if (data[0] == "ok") {
          return;
        }
        var now = new Date().getTime();
        if (data.length == 0) {
          console.log("pushqueue");
          this.db.list("/queue").push([code, now]);
        } else if (data[0][0] !== code && data.length == 1) {
          //this.db.list("/queue").push("ok");
          /**/
          if (now - data[0][1] > 120000) {
            //120000// || data[0][0].includes(this.username) prevent matching with yourself
            this.db.list("/queue").remove();
          } else {
            this.db.list("/queue").push("ok");
          }

          console.log("ok");
        } else if (data[1] == "ok" && data.length == 2) {
          console.log("init");
          // STart Game with data[0]
          this._queueSub.unsubscribe();
          this.db.list("/queue").remove();
          //console.log("startinnnn");

          var firstPlayer = code == data[0][0];

          this.initOnlineGamePlayer(firstPlayer, data[0], false, true);

          setTimeout(() => {
            this.rematchWindow.dismiss();
          }, 500);
        } else if (data.length > 2) {
          console.log("overflow");
          //this._queueSub.unsubscribe();
          this.db.list("/queue").remove();
          //console.log("AHHHHH");
          //this.rematchWindow.dismiss();
        }

        this.rematchWindow.present();
      });

    //this.db.list('/queue').remove()

    // Search for Existing people looking, queue

    // prompt others

    // failure
  }

  playOnline(random) {
    var buttons = [
      {
        text: "Create Game",
        handler: (data) => {
          this.friendPlay(true);
        },
      },
      {
        text: "Join Game",
        handler: (data) => {
          this.friendPlay(false);
        },
      },
    ];

    if (random) {
      buttons.push({
        text: "Random Opponent",
        handler: (data) => {
          this.playRandom();
        },
      });
    }

    var rez = this.alertCtrl.create({
      title: "Online Multiplayer", // Or not
      enableBackdropDismiss: false,
      subTitle: "Each player gets 30 seconds to move",
      message: "Played in real-time and at a fast pace",
      buttons: buttons,
    });

    rez.present();
  }

  endGamePrompt(won) {
    var myrank = 0;

    var draw = won === null;

    if (this.gameType == "local") {
      var prompt = this.alertCtrl.create({
        title: draw ? "Draw!" : won ? "White Won!" : "Black Won!", // Or not
        enableBackdropDismiss: false,
        buttons: [
          {
            text: "Ok",
            handler: (data) => {
              this.abandonGame(false, "local");
            },
          },
        ],
      });

      prompt.present();
      return;
    }

    if (this.gameType !== "ai" && this.gameType !== "local") {
      // rematch logic.
      this.thinking = false;
      this.removeTimer();

      //this.showInterAd();

      this.choices = [null, null, null, null];

      if (!won && !draw) {
        this.db.list(this.gameType).push("checkmated:" + myrank);
        console.log("I got checkmated");
        //this._fbSubGame.unsubscribe();
      }

      if (!draw) {
        this.updateRank(won);
      }

      this.rematchWindow = this.alertCtrl.create({
        title: draw ? "Draw!" : won ? "You Won!" : "You Lost!", // Or not
        enableBackdropDismiss: false,
        subTitle: "Would you like to play a rematch?",
        buttons: [
          {
            text: "No Thanks",
            handler: (data) => {
              this.db.list(this.gameType).push("NOREMATCH");

              this._fbSubGame.unsubscribe();

              this.abandonGame(false, "online");
            },
          },
          {
            text: "Rematch",
            handler: (data) => {
              this.db.list(this.gameType).push("REMATCH");
              this.awaitingRematch = true;
              this.resetGame();
              this.rematchWindow = this.alertCtrl.create({
                title: "Waiting for Opponent", // Or not
                enableBackdropDismiss: false,
                buttons: [
                  {
                    text: "Cancel",
                    handler: (data) => {
                      this.db.list(this.gameType).push("NOREMATCH");
                      this._fbSubGame.unsubscribe();
                      this.abandonGame(false, "ai");
                    },
                  },
                ],
              });
              this.rematchWindow.present();
            },
          },
        ],
      });

      this.rematchWindow.present();

      return;
    }


    var buttons = [
      {
        text: "Play Online",
        handler: (data) => {
          this.playRandom();
        },
      },
      {
        text: "Play Again",
        handler: (data) => {
          this.abandonGame();
        },
      },
      {
      text: won ? "Raise Difficulty" : "Lower Difficulty",
      handler: (data) => {
        this.ratchetDifficulty(won);
      }
    },
    {
      text: "Analyze Game",
      handler: (data) => {  
        this.pgnExt(this.game.pgn());
        return false;
      }
    }

    ];



    if (!draw) {
      this.updateRank(won);
    }

    var rez = this.alertCtrl.create({
      title: draw ? "Draw!" : won ? "You Won!" : "You Lost!", // Or not
      enableBackdropDismiss: false,
      subTitle:
        this.percentile() > 0
          ? "You are now ranked in the top: " +
            this.percentile() +
            "% of players worldwide"
          : "Play more games to be ranked on the leaderboards",
      //message: won?"Way to go, you're pretty good at this!":"Don't worry you can get better!",
      buttons: buttons,
    });

    rez.present();
  }

  percentile() {
    var ratio = this.record.wins / (this.record.losses + 1);
    var games = this.record.wins + this.record.losses / 3;
    var difficulty = this.record.totalChoices / (this.record.total + 1);
    var handicapAvg=this.record.handicap/(this.record.total + 1)
    var partOne = Math.pow(ratio, difficulty) + Math.pow(games, 0.2);

    var norml =
      4.1375 +
      (249597800 - 4.1375) / (1 + Math.pow(partOne / 3.241956e-9, 0.7493486));

    var partTwo = this.record.best / (this.record.worst + 1);

    var running=(norml + 2 - partTwo / 2);

    var partThree=handicapAvg*(100-running)/2000

  running=Math.pow(running,1-partThree)
    running=Math.pow(running,1.05)

    norml = Math.ceil(running);
    if (norml < 1) {
      norml = 1;
    } else if (norml > 99) {
      norml = 99;
    }

    return norml;
  }

  stockfishProcess(message) {
    //console.log(message);
    /*  */
    if (message.includes("mate 0")) {
      this.choices = [];
      return;
    }

    var depth = message.match(/info depth (-?\d+)/);

    if (depth) {
      depth = parseInt(depth[1]);
    }

    var multipv = message.match(/multipv\s(\d)/);

    var move = message.match(/pv\s(\D\d\D\d)./);

    var bestmove = message.match(/bestmove\s(\D\d\D\d).?/);

    if (bestmove) {
      if(!this.thinkingTimer){
        //the thinking timer has already exhausted. Move will be made by the fallback now. Nothing to do here.
        return;
      }
      //we have the best move, stop the thinking timer and clear the timeout
      clearTimeout(this.thinkingTimeout);
      this.thinkingTimer = false;

      

      this.choices[0] = bestmove[1];
      if (this.XOR(this.stockfishWhite,this.colorBlackAI) || this.gameType != "ai") {
        this.asyncChoices();
      } else {
        this.asyncAI();
      }
    }

    if (move && depth && multipv) {
      this.choices[parseInt(multipv[1]) - 1] = move[1];
    }
    /**/
if (depth){
  if (this.stockfishWhite){
var pwns=message.match(/cp\s(-?\d+)/);
if (pwns){
  this.centipawns=Math.trunc(parseInt(pwns[1])/10)/10;
}else{
  this.centipawns="∞"
}

  }
  this.currDepth=depth;
}

  }

  XOR(foo,bar){
return ( foo && !bar ) || ( !foo && bar )

   // return ( this.colorBlackAI && !this.stockfishWhite ) || (!this.colorBlackAI && this.stockfishWhite);
  }

  initStockfish() {
    if (this.stockfish && this.stockfish.terminate) {
      this.stockfish.terminate();
      console.log("TERMINATE");
    }
    //this.gameMoves=0;


    this.stockfish = new Worker("../../assets/stockfish.js");
    this.stockfish.onmessage = (event) => this.stockfishProcess(event.data);
    this.stockfish.postMessage(
      "setoption name MultiPV value " +
        this.numChoices +
        ", setoption name Skill Level value 20"
    );
  }

  updateStockfish(FEN: string, depth: any = 20) {

    if (this.gameType == "ai" && !this.colorBlackAI) {
      if (this.stockfishWhite== FEN.includes(" w ")) {
        console.error("two in a row STOP");
        return;
      }
    }

//console.log(this.stockfishWhite==this.colorBlackAI);

    if (this.mode=="shallow" || this.mode=="allRand"){
  depth=1;
    }
var aiskill=this.aiDepth();
var playerskill=20;


if (this.mode=="bothSides"){
  aiskill=20;
  playerskill=1;
}
console.log(aiskill);
    this.stockfishWhite = FEN.includes(" w ");

var playersturn=this.XOR(this.stockfishWhite,this.colorBlackAI)

    if (this.gameType == "ai" && !playersturn) {
      console.log('ai moving');
      this.stockfish.postMessage(
        "setoption name Skill Level value " + aiskill
      );
    } else {
      this.stockfish.postMessage("setoption name Skill Level value "+playerskill);
    }

    this.stockfish.postMessage("position fen " + FEN);
 

    const moveTime =
      this.delayTime + 300 +
      (!playersturn && this.gameType == "ai" ? this.aiBalance() : 0);
    this.stockfish.postMessage(
      "go depth " + depth + " movetime " + moveTime
    );

    this.thinkingTimer = true;
    this.thinkingTimeout = setTimeout(() => {
      //time to think has ended
      this.thinkingTimer = false;
      console.warn(
        "engine taking too long to process, using the best available choices: ",
        this.choices
      );
      //destroy bad stockfish which is taking too much time.
      this.initStockfish();
      if (playersturn || this.gameType !== "ai") {
        this.asyncChoices();
      } else {
        this.asyncAI();
      }
    }, moveTime + 500);
  }

  aiBalance() {

//return 10000-this.delayTime; //max of 10 seconds
/**/
    var x = (101 - this.percentile() - 50) * 25;
    if (x > 0) {
      return x; 
    } else {
      return 0;
    }


  }

  aiDepth(){
var depth=this.AISkill();


if (this.record.wins==0){depth=0}

depth=depth+this.handicap;

if (this.mode=="bestRand" || this.mode=="shallow" || this.mode=="pieceFocus"){
  depth+=2;
}

if (this.colorBlackAI){
  depth-=1;
}

if (depth>20){depth=20}else if (depth<0){depth=0}


    return Math.floor(depth)
  }

  calcELO() {
    var x = this.AISkill();
    var ELO = -1.3071 * Math.pow(x, 2) + 114.33 * x + 1231.2;
    return Math.floor(ELO);
  }

  AISkill() {
    //return 0;
    var x = this.percentile();
    var log = 20.56536 - 0.3061102 * x + 0.001029191 * Math.pow(x, 2);

    return log;
  }


  ngOnInit() {}

  debug() {}

  undo() {
    this.game.undo();
    this.position = this.game.fen();
  }

  setTurn(color) {
    var tokens = this.game.fen().split(" ");
    tokens[1] = color;
    this.game.load(tokens.join(" "));
  }

  resetGame(FEN: any = newGameFEN) {
    this.initStockfish();
    this.removeHighlighting("opp");
    this.removeHighlighting("player");

    this.position = ChessBoard.fenToObj(FEN);
    this.game = new Chess(FEN);
  }

  isNewGame() {
    return newGameFEN.split(" ")[0] == this.game.fen().split(" ")[0];
  }

  //K7/8/8/1r1b4/8/8/8/5k2 w - - 0 1 -- bug with more than 1 choice....
  //8/K7/8/3b4/8/8/8/1r3k2 w - - 0 1
  newGame(FEN: any = this.storedFEN) {
    if (!FEN || FEN === null) {
      FEN = newGameFEN;
    } else {
      this.setData();
    }

    if (FEN==newGameFEN){
      this.moveHistory=[];
      this.newboardgamestate=(newGameFEN=="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }else{
      this.newboardgamestate=false;
    }
    //console.log('newGame');
    this.removeHighlighting("opp");
    this.removeHighlighting("player");
    this.choices = [null, null, null, null];
    this.removeTimer();

    //FEN='8/6b1/7n/1N3b2/r2n2k1/4q1p1/P1pPpppr/1RnQKB1R w - - 2 58'
    this.position = ChessBoard.fenToObj(FEN);
    this.game = new Chess(FEN);

    //console.log(this.game);
    this.lastchoice = { move: null, rank: null };

if (this.colorBlackAI){
  this.moveAI();
}else{
    this.getChoices(this.gameType == "ai");
    }

  }

  isMoveWhite(move) {
    var rez = this.game.get(String(move).substr(0, 2));

    if (rez) {
      return rez.color == "w";
    } else {
      return null;
    }
  }

  choiceRepair() {}

  getChoices(auto: any = true) {
    console.log("GETCHOICES", this.game.fen());
    /**/
if (((this.game.fen().includes(" b ") && !this.colorBlackAI)||(this.game.fen().includes(" w ") && this.colorBlackAI)) && this.gameType == "ai") {
      console.log(this.gameType);
      console.log("ignoring Input, self correction?");
      this.corrupted();
      return;
    }


    // playerTurn
    if (this.game.game_over()) {
      this.thinking = false;

      if (this.game.game_over()) {
        if (
          this.game.in_draw() ||
          this.game.in_stalemate() ||
          this.game.insufficient_material() ||
          this.game.in_threefold_repetition()
        ) {
          this.gameConcluded(null);
        } else {
          this.gameConcluded(false);
        }
        return;
      }

      //console.log('game concluded on '+checks+' checks');

      return;
    }

    if (this.stockfishWhite == this.game.fen().includes(" w ") &&
      this.gameType == "ai" && !this.colorBlackAI
    ) {
      console.log("stopping Choice getting");
      return;
    }
    //console.log(this.game.fen())
    this.thinking = true;
    this.updateStockfish(this.game.fen());
    //console.log(this.choices);
    // setTimeout(() => {
    //   if (this.debugMode) {
    //     //this.stockfish.terminate();
    //     this.initStockfish();
    //   } else {
    //     this.stockfish.postMessage("stop");
    //   }

    //   this.asyncChoices(auto);
    // }, this.delayTime + (this.repair ? 500 : 0));
  }

  removeHighlighting(cssDef) {
    Array.from(document.querySelectorAll(".square-55d63")).forEach((square) => {
 square.classList.remove("highlight-" + cssDef+"-default");
 square.classList.remove("highlight-" + cssDef+"-frozen");
 square.classList.remove("highlight-" + cssDef+"-lime");
 square.classList.remove("highlight-" + cssDef+"-leipzig");
 square.classList.remove("highlight-" + cssDef+"-chess24");





    });
  }

  highlightSquare(square, cssDef) {
    //console.log(document.querySelector('.square-' + square));
    //console.log(document.querySelector('.square-' + square).className);

    // color: any = "default";

    var sq = document.querySelector(".square-" + square);

    if (sq) {
      sq.className += " " + "highlight-" + cssDef+"-"+this.color;
    }
  }

  asyncChoices(auto: any = true) {
   // console.log("asyncChoices: ", this.choices);
    var arr = [];
    this.selected = 999;
    //------------------------------------

    //console.log(this.choices)

    //console.log(this.choices);
    //console.log(this.choices)

    //ensure moves are all for player!!!! boom.

    // deduplicate final moves
    var written: any = [];

    //console.log("before process arr ", this.gameType, this.choices.map(this.isMoveWhite.bind(this)), this.playerOne);
    this.choices.forEach((c, i) => {
if (c && !written.includes(c)) {
        if (
          this.gameType == "local" ||
          this.XOR(this.isMoveWhite(c),this.colorBlackAI) ||
          !this.playerOne
        ) {
          arr.push({ choice: c, rank: written.length + 1 });
          written.push(c);
        }
      }
    });
    /**/


      //if (Math.random()>.5){arr=[]} // DEBUGGGG

      if (arr.length == 0 && !this.repair) {
        console.log("empty array! attempting repair");
        this.repair = true;
        this.initStockfish();
        //console.error(this.thinking);
        this.stockfishWhite = false;
        setTimeout(() => {
          this.getChoices();
        }, 150);

        return;
      } else {
        //console.log(arr);
        this.repair = false;
      }


    if (arr.length == 0) {
      console.error("Stockfish returned NO moves");
      this.currDepth=0;
      //alert('stockfish returned NO moves');
    }



    if (this.newboardgamestate){
var moves=this.shuffle(whiteOpenings).slice(0,this.numChoices)
console.log(moves);
arr=[]

moves.forEach((move)=>{
  arr.push({choice:move,rank:-1})
})

    }

if (this.mode=="bestRand" && arr.length>0){
var temp=arr[0]
arr=[]
arr[0]=temp;

    }

    if (this.mode=="allRand"){
      arr=[];
    }



 if (this.mode=="pieceFocus"){
this.finalChoices=this.pieceModeChoices(arr[0])
 }else{
   this.finalChoices=this.shuffle(this.fillOutLegal(arr,written));
 }

    this.thinking = false;
    //console.log(this.finalChoices)
    /**/
    if (!this.prompt && auto) {
      this.prevToggle(true);
    }

    //this.prevMove(this.finalChoices[this.selected],this.selected)
  }

  prevToggle(auto: boolean = false) {
    this.tapPrompt = false;
    clearTimeout(this.helpTimer);
    this.prompt = false;

    if (this.thinking) {
      return;
    }    

    if (this.highlighted!==0){
      this.showOldState(null,0);
      return;     
    }

    if (this.waitMove || (this.finalChoices[0] == 1 && !this.newboardgamestate)) {
      return;
    }

    this.waitMove = true;
    //  console.log(this.selected);
    if (this.finalChoices.length - 2 < this.selected) {
      this.selected = 0;
    } else {
      this.selected++;
    }
//console.log('hello');
    this.prevMove(this.finalChoices[this.selected], this.selected, auto);
  }

  makeMove() {
    this.tapPrompt = false;
    clearTimeout(this.flashTimeout);
    clearTimeout(this.helpTimer);

    if (!this.playersTurn) {
      return;
    }

    if (this.thinking) {
      return;
    }

    if (this.highlighted!==0){
      this.showOldState(null,0);
      return;     
    }

    console.log(this.finalChoices);
    if (!this.finalChoices[this.selected]) {
      this.prevToggle(true);

      this.helpTimer = setTimeout(() => {
        this.help();
      }, 3500);

      return;
    } else {
      this.thinking = true;
    }

    //console.log('fires');

    this.actuallyMakeMove();
    // ()()()()()()()
  }

  actuallyMakeMove = _.throttle(this.actuallyMakeMoveInner.bind(this), 2500);



  actuallyMakeMoveInner() {
    this.lastchoice.rank = this.finalChoices[this.selected].rank;
    this.lastchoice.move = this.finalChoices[this.selected].choice;
    //this.gameMoves++

    if (this.gameType !== "local") {
      if (this.mode=="nBest"){
      this.record.total++;
      this.record.handicap+=this.handicap;
    }else{
      this.record.modeTotals[this.mode]++
    }

      if (this.record.total==171 && !this.newsletterSigned){
        this.newsletterPop();
      }
      //console.log(this.lastchoice.rank+1)
      if (this.mode=="nBest"){
      if (this.lastchoice.rank == 1 && this.finalChoices.length > 1) {
        this.record.best++;
      } else if (this.lastchoice.rank == this.numChoices) {
        //console.log('ahhhh');
        this.record.worst++;
        this.apticCall(); // TEST??????
      }
    }else if (this.mode=="bestRand"){
if (this.lastchoice.rank !== 1){
  this.apticCall(); // TEST??????
}
    }
      this.percent = this.percentile();
      this.elo=this.calcELO();
      this.record.totalChoices += this.numChoices - 1;
    }
    //console.log(this.lastchoice);
    var choice = this.finalChoices[this.selected].choice;
    var moveObj = {
      from: choice.substring(0, 2),
      to: choice.substring(2, 4),
      promotion: "q",
    };
    this.game.move(moveObj);
    this.newboardgamestate=false;
    this.thinking = true;

setTimeout(()=>{
this.pushMoveHistory(moveObj,this.lastchoice.rank == 1);
},500)
    //}
    //this.incrAds()

    //this.finalChoices=[]
    //this.setTurn('b');
    this.choices = [null, null, null, null];
    this.removeTimer();


    if (this.gameType == "local") {
      this.whiteBottom = !this.whiteBottom;
      //this.position = this.game.fen();
      //console.log(this.position);
      this.removeHighlighting("opp");
      var hist = this.game.history({ verbose: true });
      setTimeout(() => {
        this.highlightSquare(hist[hist.length - 1]["from"], "opp");
        this.highlightSquare(hist[hist.length - 1]["to"], "opp");
      }, 500);

      this.getChoices();
    } else if (this.gameType == "ai") {
      this.moveAI();
    } else {
      this.playersTurn = false;

      if (
        this.game.in_draw() ||
        this.game.in_stalemate() ||
        this.game.insufficient_material() ||
        this.game.in_threefold_repetition()
      ) {
        this.gameConcluded(null);
      } else {
        this.startTimeout();
      }

      this.db.list(this.gameType).push(moveObj);
    }

    if (this.delayTime > 0) {
      this.randNum = Math.floor(Math.random() * 50);
      this.flashResult = true;
      this.flashTimeout = setTimeout(() => {
        this.flashResult = false;
      }, 3000);
    }
  }

  help() {
    if (this.thinking) {
      //alert("use a different thinkTime?");
      return;
    }

    if (this.flashResult || this.timerVal > 0 || this.percent < 30) {
      //this.showStats();
    } else {
      this.tapPrompt = true;
      setTimeout(() => {
        this.tapPrompt = false;
      }, 1800);
    }
  }


lookupOpening(opening){
  if (!opening){opening=this.currOpening.w}
this.openLink('https://lichess.org/study/search?q="'+opening.name+'"');
}

  pushMoveHistory(move,best:any=false){

var fen=this.game.fen();
var pgn=this.game.pgn()

if (fen.includes(" w ")){
 this.currOpening.w=openings.w[fen.replace(/\sw\s.+/g,'')]
}else if (fen.includes(" b ")){
this.currOpening.b=openings.b[fen.replace(/\sb\s.+/g,'')]
}


if (this.mobile){return}

var get= this.game.get(move.to);
var obj={pgn:pgn,best:best,from:move.from,dest:move.to,piece:get.type.toUpperCase(),color:get.color,adv:(this.centipawns>0?'+'+String(this.centipawns):String(this.centipawns)),fen:fen}

this.moveHistory.push(obj)
  }


  showOldState(move,i){
if (this.highlighted==i){return}
this.highlighted=i;

if (!move){
  move=this.moveHistory[0]
}


this.position = move.fen;
this.removeHighlighting("player");
this.removeHighlighting("opp");
this.highlightSquare(move.dest, (move.color=='w'?"player":"opp"));
this.highlightSquare(move.from, (move.color=='w'?"player":"opp"));



  }

  openLink(url){
if (this.mobile){
  window["open2"](url,"_system")
}else{
  window.open(url,"_blank")
}
  }

  showStats(mobile:any=false) {

if (mobile && (this.moveHistory.length==1 || this.record.total==0 || this.currOpening.b || this.currOpening.w)){
  return;
}

   if (this.alertBox && this.alertBox._state==3){
  this.alertBox.dismiss();
  return;
}

    this.alertBox = this.alertCtrl.create({
      title: "Stats", // Or not
      enableBackdropDismiss: true,
      //subTitle: "A breakdown of your moves",
      cssClass: "stats",
      message:
        "<b>Best</b> move chosen <b>" +
        Math.floor(
          (this.record.best /
            (this.record.total == 0 ? 1 : this.record.total)) *
            100
        ) +
        "</b>% of the time<br><br><b>Worst</b> move chosen <b>" +
        Math.floor(
          (this.record.worst /
            (this.record.total == 0 ? 1 : this.record.total)) *
            100
        ) +
        "</b>% of the time<br><br>You have played <b>" +
        this.record.total +
        "</b> moves<br><br>Your average # of choices is <b>" +
        (Math.floor(
          (this.record.totalChoices /
            (this.record.total == 0 ? 1 : this.record.total)) *
            100
        ) /
          100 +
          1) +
        "</b><br><br>Your average difficulty bias is <b>" +
        (Math.floor(
          (this.record.handicap /
            (this.record.total == 0 ? 1 : this.record.total)) *
            10000
        ) /
          10000) +
        "</b><br><br>You have <b>" +
        this.record.wins +
        "</b> wins and <b>" +
        this.record.losses +
        "</b> losses<br><br>You are ranked in the top <b>" +
        this.percentile() +
        "</b>% of players worldwide<br><br>Your current estimated ELO is <b>" +
        this.calcELO() +
        "</b>",

    });

    this.alertBox.present();
  }

pieceModeChoices(best){
console.log(best);
var legalMoves = this.shuffle(this.game.moves({ verbose: true }));
var choices=[best];

 legalMoves.forEach((move) => {

           if (move.from==best.choice.substring(0, 2) && best.choice!==move.from+move.to){
 choices.push({ choice: move.from+move.to, rank: 0 });
           }
    });

     if (choices.length > 8) {
      choices = choices.filter((a) => a.rank <= this.numChoices);
      choices=choices.slice(0,8)
    }


return this.shuffle(choices)

}

fillOutLegal(arr,written){
if (arr.length == this.numChoices){return arr}
    // fill out empty moves with random moves....
    var legalMoves = this.shuffle(this.game.moves({ verbose: true }));

    legalMoves.forEach((move) => {
      var concat = move.from + move.to;
// bias toward moves that include promotion or capture
      if ((move.flags.includes("p") || move.flags.includes("c")) && !written.includes(concat)) {
        arr.push({ choice: concat, rank: .5 });
        written.push(concat);
      }else if (arr.length < this.numChoices) {
        if (!written.includes(concat)) {
          arr.push({ choice: concat, rank: 0 });
          written.push(concat);
        }
      }
    });

    if (arr.length > this.numChoices) {
      arr = arr.filter((a) => a.rank <= this.numChoices);
      arr=arr.slice(0,this.numChoices)
    }
arr.forEach((move)=>{if (move.rank==.5){move.rank=0}})

    return arr;
  }

  isNull(arr) {
    //console.log(arr.join().replace(/,/g,'').length === 0)
    return arr.join().replace(/,/g, "").length === 0;
  }

  aiBlunder() {
    return 0; // NEVER blunders
  }

  asyncAI() {
    var move;
    //console.log(this.choices);
    this.choices = this.choices.filter((el) => {
      return el != null;
    });

    if (this.XOR(this.isMoveWhite(this.choices[0]),this.colorBlackAI)) {
      console.log("players got switched 1468");
      this.corrupted();
      //return;
    }

    //var aiMove = Math.floor(this.aiBlunder() * this.choices.length);
    //console.log(aiMove);
    move = this.choices[0];

    /*
    if (Math.random() < this.AIlevel.chance/this.delayTime) {
      move = this.choices[Math.floor(Math.random() * this.choices.length)]
    } else {
      move = this.choices[0]
    }
*/
    if (typeof move == "undefined" || this.mode=="allRand") {
if (!move){console.error("MOVE UNDEFINED, picking random");}
      
move=this.fillOutLegal([],[])[0].choice
    }


    //console.error("move is sometimes UNDEFINED");
    //console.log(move)
    //alert(move);

    this.removeHighlighting("opp");
    this.highlightSquare(move.substring(0, 2), "opp");
    this.highlightSquare(move.substring(2, 4), "opp");
    //console.log(move);
var moveObj = {
      from: move.substring(0, 2),
      to: move.substring(2, 4),
      promotion: "q",
    };

    this.game.move(moveObj);

setTimeout(()=>{
  this.pushMoveHistory(moveObj);
  if (this.gameType !== "ai"){
  if (this.storedFEN!==null){
    this.storedFEN=null;
    this.setData()
  }
}else{
this.storedFEN=this.game.fen()
this.setData();
}
},500)



    this.newboardgamestate=false;
    //this.gameMoves++
    //this.gameMoves++
    this.choices = [null, null, null, null];
    this.position = this.game.fen();
    //console.log(this.position);
    this.getChoices();
    //this.setData()
  }

  moveAI() {
    if (this.game.game_over()) {
      //console.log('game concluded on checks');

      if (
        this.game.in_draw() ||
        this.game.in_stalemate() ||
        this.game.insufficient_material() ||
        this.game.in_threefold_repetition()
      ) {
        this.gameConcluded(null);
      } else {
        this.gameConcluded(true);
      }

      return;
    }

    this.thinking = true;
    this.updateStockfish(this.game.fen());
  }

  prevMove = _.debounce(this.prevMoveInner.bind(this), 250);

  prevMoveInner(choice, i, auto: boolean = false) {
    if (typeof choice == "undefined") {
      return;
    }
    //console.log(choice);
    //setTimeout(()=>{})
    /**/
    this.position = this.game.fen();
    this.selected = i;

    this.removeHighlighting("player");
    this.highlightSquare(choice.choice.substring(0, 2), "player");
    this.highlightSquare(choice.choice.substring(2, 4), "player");

    setTimeout(() => {
      this.waitMove = false;
      var preview = new Chess(this.game.fen());
      preview.move({
        from: choice.choice.substring(0, 2),
        to: choice.choice.substring(2, 4),
        promotion: "q",
      });

      this.position = preview.fen();
      //this.thinking = false; //()()()() what?
      //console.log('fires');
      //console.log(preview.ascii());
    }, 250);
  }

  showOfflineAd() {
    var ad = offlineProjects[this.offlineAdIndex];

    let alertWin = this.alertCtrl.create({
      title: ad.title,
      enableBackdropDismiss: false,
      //subTitle: ad.subTitle,
      message:
        '<img class="adIcon" src="assets/ads/' +
        ad.icon +
        '.png">' +
        ad.description,
      buttons: [
        {
          text: "No Thanks",
          //role: 'cancel',
          handler: () => {},
        },
        {
          text: ad.button,
          handler: () => {
            var url = this.iOS ? ad.iOS : ad.android;
            this.openLink(url)
          },
        },
      ],
    });
    alertWin.present();

    if (offlineProjects.length - 1 == this.offlineAdIndex) {
      this.offlineAdIndex = 0;
    } else {
      this.offlineAdIndex++;
    }
  }

  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  incrAds() {
    this.adPromptCounter++;

    if (
      this.adPromptCounter > this.adPromptThreshold &&
      (this.gameType == "ai" || this.gameType == "local")
    ) {
      this.adPrompt();
    }

    if (this.adPromptCounter > 0 && this.supressAds) {
      this.adPrompt(true);
      //this.adPrompt();
    } else if (this.adPromptCounter % 5 == 0) {
      this.setData();
    }
  }



  cp(){

if (this.alertBox && this.alertBox._state==3){
  this.alertBox.dismiss();
  return;
}

   this.alertBox = this.alertCtrl.create({
      title: "Advantage",
      subTitle:"An Estimate of Who is Ahead",
      cssClass:'stats',
      message:
        "A positive score (\"<b>+</b>\") means white has a stronger position where a negative number (\"<b>-</b>\") implies black is favored. The value roughly translates to \"<b>pawns</b>\" where a knight of bishop has a value of 3 pawns, a rook is given a value of 5 pawns, and a queen is worth 9. In other words, it is estimated that "+(this.centipawns>0?"white":"black") + " is currently ahead by <b>"+(this.moveHistory.length>0?this.centipawns:"0.3")+ "</b> pawns. White is estimated to have an advantage over black at the beginning of the game since they get to go first. You can toggle your color against the AI below.",

inputs:[
   {
        type: 'radio',
        label: 'White',
        value: 'white',
        checked: this.whiteBottom
    },{
        type: 'radio',
        label: 'Black',
        value: 'black',
        checked: !this.whiteBottom
    }],

      buttons: [
      {
          text: "Ok",
          handler: (data) => {

if ((data=='white')==this.whiteBottom){

}else{
     if (this.gameType!=="ai"){
              this.pop("Error","In multiplayer mode, color is assigned according to whether you are the one inviting a friend to a game (white) or whether you are accepting (black). For random opponents it depends if you were the first in the queue.")
            }else{
// abandonGame
this.abandonGame(true,"ai",false,{ fen: newGameFEN },data=='black')
   }
}
          }
        },
      ],
    });
    this.alertBox.present();
  }

  dpth(){

    if (this.mode=="allRand"){
      this.pop("Stockfish Unavailable","Stockfish is turned off in this mode as all moves are merely random. Change the game mode to use this setting.")
      return;
    }

    if (this.currDepth==0 && !this.thinking){
        console.log("empty array! attempting repair");
        this.repair = false;
        this.initStockfish();
        //console.error(this.thinking);
        this.stockfishWhite = false;
        setTimeout(() => {
          this.getChoices();
        }, 150);

return;
    }

if (this.alertBox && this.alertBox._state==3){
  this.alertBox.dismiss();
  return;
}

this.alertBox = this.alertCtrl.create({
      title: "Think Time & Depth",
      message:"The longer your device takes to compute the best move, the better quality moves you will get, indicated by a depth score of 1-20.",
         inputs:[
    {
        type: 'radio',
        label: '500 ms',
        value: '200',
        checked: this.delayTime==200
    },{
        type: 'radio',
        label: '1 sec',
        value: '700',
        checked: this.delayTime==700
    },{
        type: 'radio',
        label: '2 sec',
        value: '1700',
        checked: this.delayTime==1700
    },{
        type: 'radio',
        label: '5 sec',
        value: '4700',
        checked: this.delayTime==4700
    }],
      buttons: [
     
        {
          text: "ok",
          handler: (data) => {


            if (this.delayTime!==parseInt(data)){
   if (thresh.indexOf('depth') > this.stars) {
      this.starPrompt("depth");
    }else{
              this.delayTime=parseInt(data);
              this.setData();
              }
            }
          },
        },
      ],
    });




    this.alertBox.present();
  }

  hdnicp(){
    if (this.alertBox && this.alertBox._state==3){
  this.alertBox.dismiss();
  return;
}
this.alertBox = this.alertCtrl.create({
      title: "AI Bias",
      message:"Lazy Chess is carefully designed to scale the ai difficulty to your abilities and rank, but you can manually tweak the difficulty below. <i>Positive values are harder, negative values are easier.</i><br><br>Current AI Skill: <b>"+this.aiDepth()+"</b> (out of 20)",

 inputs:[
 {
        type: 'radio',
        label: 'Lower Skill Level',
        value: '-1',
        checked: false
    },
{
        type: 'radio',
        label: 'Keep Level '+this.handicap,
        value: '0',
        checked: true
    },{
        type: 'radio',
        label: 'Raise Skill Level',
        value: '1',
        checked: false
    }],

      buttons: [
        {
          text: "Ok",
          handler: (data) => {


if (data!==0 && thresh.indexOf('bias') > this.stars){
      this.starPrompt("bias");
}

if (data>0){
  if (this.AISkill()+1>21){
    this.reachedLimit(true)
    return;
  }
  this.handicap++
     this.setData();
}else if (data<0){
    if (this.AISkill()-1<1){
    this.reachedLimit(false)
    return;
  }
this.handicap--
   this.setData();
}


          },
        },
      ],
    });
    this.alertBox.present();
  }

reachedLimit(raise){
   let alert = this.alertCtrl.create({
      title: "Limit Reached",
      //subTitle:"An Estimate of Who is Ahead",
      message:"Difficulty cannot be "+(raise?'raised':'lowered')+" more than it is. Difficulty is determined by depth for which stockfish accepts a value between 1-20. The depth given to the ai plus your bias is outside this value. Try raising or lowering the depth / think time setting instead to compensate.",
      buttons: [
        {
          text: "Ok",
          handler: () => {
          },
        },
      ],
    });
    alert.present();
}


  history(){
    if (this.alertBox && this.alertBox._state==3){
  this.alertBox.dismiss();
  return;
}

var pgn=this.game.pgn();

if (!pgn){

this.alertBox = this.alertCtrl.create({
      title: "Move History",
      message:
        "Once you or your opponent have played, you can review a <b>PGN</b> of your game, copy it to your clipboard and even analyze it on <b>lichess.com</b>.",
      buttons: [
        {
          text: "Ok",
          handler: () => {
          },
        },
      ],
    });
    this.alertBox.present();



}else{

this.alertBox = this.alertCtrl.create({
      title: "PGN Move History",
      //subTitle:"A PGN of the game is below",
      message:pgn,
      buttons: [
      {
          text: "Copy to Clipboard",
          handler: () => {
if (thresh.indexOf('pgn') > this.stars) {
      this.starPrompt("pgn");
      return;
    }
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = pgn;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
         }
       },
        {
          text: "Analyze Game",
          handler: () => {
if (thresh.indexOf('pgn') > this.stars) {
      this.starPrompt("pgn");
      return;
    }
            this.pgnExt(pgn);
          },
        },
      ],
    });
 this.alertBox.present();

}
  }

  pgnExt(pgn){

if (!window.navigator.onLine) {
      this.noInternet();
      return;
    }

    //var pgn=this.game.pgn();
    const url='https://lichess.org/api/import'
    var body="pgn="+pgn;

    //console.log(body);

    var pram={
      method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded;charset=UTF-8"},
      body:body
      
    }
fetch(url,pram)
.then(data=>{return data.json()})
.then(res=>{
  this.openLink(res.url)
})
.catch(error=>{
this.pop("Error","There was an error trying to analyze your game, please try again later.")
})


  }


popNews(title,txt) {
    let alert = this.alertCtrl.create({
      title: title,
      message:txt,
      buttons: [
        
        {
          text: "Later",
          handler: () => {},
        },
        {
          text: "Newsletter",
          handler: () => {
            this.newsletterPop();
          },
        }
      ],
    });
    alert.present();
  }

pop(title,txt) {
    let alert = this.alertCtrl.create({
      title: title,
      message:txt,
      buttons: [
        
        {
          text: "Ok",
          handler: () => {},
        },
      ],
    });
    alert.present();
  }

  newsletterPop(){

var message="<b>Get special launch discounts and keep up with our non-profit!</b> Unsubscribe anytime.";
var title="Email Sign-Up";

if (this.newsletterSigned){
 message+=" Note: As you have already signed up once, you are not eligible for another star.";
}else{
  message+=" You will need to verify ownership of your email with a disposable code.";
  title+=" and 1 Star!";
}

let alert = this.alertCtrl.create({
      title: title,
      message: message,
        inputs: [
      {
        name: 'email',
        placeholder: 'Your Email'
      }
      
    ],
      buttons: [
        {
          text: "Later",
          //role: 'cancel',
          handler: () => {},
        },
        {
          text: "Ok!",
          handler: (data) => {

if (!window.navigator.onLine){
this.noInternet();
  return;
}
var postAt=data.email.match(/@(.+)/i)

if (/(.+)@(.+){2,}\.(.+){2,}/.test(data.email) && data.email.length>7 && postAt && !emailDomainBlacklist.includes(postAt[1])){

fetch("https://cinqmarsmedia.us2.list-manage.com/subscribe/post?u=551a0b16e3eff4f13cbac507b&amp;id=5e54ff5bad", {
    method: "POST",
    mode: 'no-cors',
headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  },
    body: "EMAIL="+data.email,
  });

if (!this.newsletterSigned){
this.earnedUpgrade(false);
}
this.newsletterSigned=true;

}else{
 // alert('please enter a valid email');
 alert.setMessage(message+'<br><span class="red">Please Enter a Valid Email</span>')
  return false
}


          },
        },
      ],
    });
    alert.present();

  }

  ratingPop() {
    let alert = this.alertCtrl.create({
      title: "Please Rate and Review",
      message:
        "If you are enjoying the game, please rate and/or review. Your feedback helps expose the project to others",
      buttons: [
        {
          text: "Later",
          //role: 'cancel',
          handler: () => {},
        },
        {
          text: "Ok",
          handler: () => {
            //if (this.mobile){
            this.launchReview.launch().then((result) => {
              this.reviewed = true;
              this.setData();
            });
          },
        },
      ],
    });
    alert.present();
  }

  promptRating() {
    // fallback?
    if (this.launchReview.isRatingSupported()) {
      this.launchReview.rating();
    } else {
      this.ratingPop();
    }
  }



  showRewardAd() {
    if (!this.mobile) {
      console.log("reward video!");
      //alert("Reward Vid");
      this.earnedUpgrade(false);
      return;
    }
    this.loadingPop.present();

    if (typeof admob !== "undefined") {
      admob.rewardVideo
        .load({
          id: admobIDReward,
        })
        .then(() => admob.rewardVideo.show());
    }
  }

  showInterAd() {
    if (this.stars >= starThreshold) {
      return;
    }

    if (!this.mobile) {
      alert("Inter Ad");
      return;
    }

    var numGamesPlayed = this.record.wins + this.record.losses;

    if (window.navigator.onLine) {
      if (numGamesPlayed == 0 && !this.shownConsent) {
        setTimeout(() => {
          this.showConsents();
        }, 8000);
      } else {
        if (numGamesPlayed % 6 == 5 && !this.reviewed) {
          this.promptRating();
        } else {
          if (typeof admob !== "undefined") {
            admob.interstitial
              .load({
                id: admobIDInter,
              })
              .then(() => admob.interstitial.show());
          }
        }
      }
    } else {
      this.showOfflineAd();
    }

  }

  async showConsents() {
    const consent = window["consent"];

    if (!this.shownConsent) {
      this.shownConsent = true;
      this.setData();
    } else {
      return;
    }
    //if nonEU, just get the ios14 consent and return...
    let isEU: boolean = await consent.isRequestLocationInEeaOrUnknown();
    if (!isEU) {
      //show ios consent if needed
      this.usePersonalisedAds = true;
      if (window["device"] && window["device"].platform == "iOS") {
        try {
          await this.showIos14Consent();
          console.log("ios 14 consent shown successfully");
          return;
        } catch (err) {
          console.error(err);
          return -1;
        }
      }
      return;
    }

    //EU - check for GDPR first, and then asked for consent if allowed by the user.
    try {
      let res = await this.showGDPRConsent();
      console.log("GDPR consent shown successfuly", res);
      if (res == "PERSONALIZED") {
        console.log("personalised ads approved from gdpr");
        this.usePersonalisedAds = true;
        if (window["device"] && window["device"].platform == "iOS") {
          await this.showIos14Consent();
          console.log("ios 14 consent shown successfully");
        }
      }
      return;
    } catch (err) {
      console.error(err);
      return -1;
    }
  }

  async showIos14Consent() {
    if (parseFloat(window["device"].version) < 14) {
      return;
    }

    const consent = window["consent"];
    try {
      return await consent.requestTrackingAuthorization();
    } catch (err) {
      console.error(err);
      return -1;
    }
  }

  async showGDPRConsent() {
    const consent = window["consent"];
    const publisherIds = ["<publisherID>"];

    //uncomment the below two lines to simulate EU region, maybe...
    // await consent.addTestDevice('33BE2250B43518CCDA7DE426D04EE231')
    // await consent.setDebugGeography('EEA')

    console.log(await consent.checkConsent(publisherIds));
    const ok = await consent.isRequestLocationInEeaOrUnknown();
    console.log("from eu or unknown - ", ok);

    const form = new consent.Form({
      privacyUrl: "https://policies.google.com/privacy",
      adFree: false,
      nonPersonalizedAds: true,
      personalizedAds: true,
    });

    await form.load();
    const result = await form.show();
    return result;
  }
}
