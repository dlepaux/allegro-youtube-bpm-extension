import ext from "./utils/ext";
import storage from "./utils/storage";

import Display from "./allegro/display";
import allegro from "./allegro/allegro";
import j2c from "j2c";
import style from "./allegro/style";
import Recorder from "./allegro/recorder";
//import URL from "./allegro/url";

// Init Project Config in Global
global.allegro = {
  env: document.location.href.indexOf('youtube.com') == -1 ? 'development' : 'production',
  // Init j2c instance
  j2c: j2c(),
  // Init AudioContext
  audioContext: new (window.AudioContext || window.webkitAudioContext)()
};
// Get and init style
global.allegro.sheet = global.allegro.j2c.sheet(style.css);

var HTMLElement = allegro.getAudioElement();
console.log(HTMLElement.currentSrc);
/*
var blob = new Blob(["Hello, world!"], { type: 'text/plain' });
var blobUrl = URL.createObjectURL(blob);

var xhr = new XMLHttpRequest;
xhr.responseType = 'blob';

xhr.onload = function() {
   var recoveredBlob = xhr.response;

   console.log(recoveredBlob)

};

xhr.open('GET', HTMLElement.currentSrc);
//xhr.send();*/

/*
var recorder = null;

// Display recorded sound
storage.getDataStored((data) => {
  var display = new Display(data);
  display.addBPMinTitles();
  global.allegro.display = display;

  // Try to catch a HTMLElement

  // Recorder
  if (HTMLElement) {
    // Set recorder listener
    recorder = new Recorder({element: HTMLElement});
    recorder.listen();
  } else {
    console.log('No audio/video node found in this page !');
  }

  // Youtube Special Listener
  document.addEventListener("spfrequest", function () {
    recorder.clear();
    global.allegro.audioContext.suspend();
    console.log('spf request');
  }, false);
  document.addEventListener("spfdone", function () {
    global.allegro.audioContext.resume();
    storage.getDataStored((data) => {
      global.allegro.display.update(data);
    });
    console.log('spf done');
    //that.init();
  }, false);
});


////////////////////////
// DEVELOPMENT LISTENER
////////////////////////
if (global.allegro.env == 'development') {
  document.getElementById('set-test-data').addEventListener('click', function (e) {
    e.preventDefault();
    console.log('set Data Test');
    storage.storeResultInStorage('c3c3c3', 125);
  }, true);
  document.getElementById('extension-analyse').addEventListener('click', function (e) {
    e.preventDefault();
    console.log('extension-analyse');
    recorder.listen();
    HTMLElement.play();
  });
  document.getElementById('extension-pause').addEventListener('click', function (e) {
    e.preventDefault();
    console.log('extension-pause');
    HTMLElement.pause();
  });
  document.getElementById('extension-stop').addEventListener('click', function (e) {
    e.preventDefault();
    console.log('extension-stop');
    HTMLElement.currentTime = 0;
    HTMLElement.pause();
  });

  window.onpopstate = function(e){
    if(e.state){
      document.title = e.state.pageTitle;
    }
  };

  // AutoPlay
  //var wait = setTimeout( function () {
  //  HTMLElement.play();
  //}, 300);
}
////////////////////////
// END
////////////////////////


var extractPageData = () => {
  var url = document.location.href;
  if(!url || !url.match(/^http/) || !HTMLElement) return {hasAudio: false};

  var data = {
    hasAudio: true,
    youtubeId: "",
    title: "",
    origin: "",
    duration: "",
    isAnalysing: recorder.isAnalysing
  }

  // Get origin
  data.origin = document.location.hostname;

  // Get youtube ID
  var params = URL.getQueryParams(document.location.search);
  if (typeof(params.v) != 'undefined') {
    data.youtubeId = params.v;
  } else {
    data.youtubeId = params.id;
  }

  // Get durationForHuman
  var date = new Date(null);
  date.setSeconds(HTMLElement.duration); // specify value for SECONDS here
  data.duration = date.toISOString().substr(11, 8);
  if (data.duration.indexOf('00:') === 0 ) data.duration = data.duration.substring(3, data.duration.length);

  // Get title
  var ogTitle = document.querySelector("meta[property='og:title']");
  if(ogTitle) {
    data.title = ogTitle.getAttribute("content")
  } else {
    data.title = document.title
  }
  console.log(data);
  return data;
}

ext.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (request.action === 'process-page') {
    sendResponse(extractPageData());
  }
  if (request.action === 'analyse-bpm') {
    recorder.listen();
    HTMLElement.play();
  }
  if (request.action === 'kill-analyze') {
    recorder.clear();
  }
  if (request.action === 'update-bpm') {
    storage.storeResultInStorage(request.v, request.bpm);
  }
});

*/
