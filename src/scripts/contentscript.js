import ext from "./utils/ext";
import storage from "./utils/storage";

import Display from "./allegro/display";
import j2c from "j2c";
import style from "./allegro/style";
import Recorder from "./allegro/recorder";
import URL from "./allegro/url";

// Init Project Config in Global
global.allegro = {
  env: 'unknow',
  // Init j2c instance
  j2c: j2c(),
  // Init AudioContext
  audioContext: new (window.AudioContext || window.webkitAudioContext)()
};
// Get and init style
global.allegro.sheet = global.allegro.j2c.sheet(style.css);

// Detect/Set Environment
global.allegro.env = document.location.href.indexOf('youtube.com') == -1 ? 'development' : 'production';
//console.log('env : ' + global.allegro.env);

// Display recorded sound
storage.getDataStored((data) => {
  var display = new Display(data);
  display.addBPMinTitles();
  global.allegro.display = display;

  // Try to catch a HTMLElement
  var HTMLElement = global.allegro.env == 'development' ? document.querySelector('audio') : document.querySelector('video');

  // Recorder
  var recorder = null;
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
}
////////////////////////
// END
////////////////////////


var extractTags = () => {
  var url = document.location.href;
  if(!url || !url.match(/^http/)) return;

  var data = {
    title: "",
    description: "",
    url: document.location.href
  }

  var ogTitle = document.querySelector("meta[property='og:title']");
  if(ogTitle) {
    data.title = ogTitle.getAttribute("content")
  } else {
    data.title = document.title
  }

  var descriptionTag = document.querySelector("meta[property='og:description']") || document.querySelector("meta[name='description']")
  if(descriptionTag) {
    data.description = descriptionTag.getAttribute("content")
  }

  return data;
}

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    sendResponse(extractTags());
    console.log('whoop whoop');
  }
}
console.log('whoop whoop 2');

ext.runtime.onMessage.addListener(onRequest);