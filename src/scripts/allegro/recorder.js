'use strict';

import ext from "./../utils/ext";
import storage from "./../utils/storage";
import buffer from "./../utils/buffer";
import BPM from "./bpm";
import URL from "./url";

class Recorder {

  constructor (config = {}) {
    // Default options
    this.options = {
      element: null,
      scriptNode: {
        bufferSize: 4096,
        numberOfInputChannels: 1,
        numberOfOutputChannels: 1
      }
    }
    // Merge Defaults with config
    Object.assign(this.options, config);
    // Shortcut
    this.audioContext = global.allegro.audioContext;
    // Source
    this.source = this.audioContext.createMediaElementSource(this.options.element);
    // Custom Event
    /*if (window.CustomEvent) {
      var event = new CustomEvent("newMessage", {
        detail: {
          message: msg,
          time: new Date(),
        },
        bubbles: true,
        cancelable: true
      });

      this.options.element.dispatchEvent(event);
    }*/
  }

  connect () {
    console.log('connect');
    // ScriptNode
    this.scriptNode = this.audioContext.createScriptProcessor(this.options.scriptNode.bufferSize, this.options.scriptNode.numberOfInputChannels, this.options.scriptNode.numberOfOutputChannels);
    this.scriptNode.connect(this.audioContext.destination);
    // Source connects
    this.source.connect(this.scriptNode);
    this.source.connect(this.audioContext.destination);
    // Buffer
    this.increment = 0;
    this.audioBuffer = null;
    this.superBuffer = null;
    this.arrayBuffer = [];
    // Counter
    this.progressionPC = 0;
    this.timeSpent = 0.0;
    // Flag
    this.isAnalysing = false;
  }

  clear () {
    console.log('clear');
    //this.source.disconnect(0);
    //this.scriptNode.disconnect(0);
    this.scriptNode.onaudioprocess = null;

    this.increment = 0;
    this.audioBuffer = null;
    this.superBuffer = null;
    this.arrayBuffer = [];

    this.progressionPC = 0;
    this.timeSpent = 0.0;

    this.isAnalysing = false;
  }

  listenAudioProcess () {
    console.log('listenAudioProcess' + this.options.element.duration);
    var that = this;
    this.scriptNode.onaudioprocess = function (e) {
      if (that.isAnalysing) {
        // Send calculated progression to popup
        that.timeSpent += e.inputBuffer.duration;
        that.progressionPC = that.progressionPC >= 100 ? 100 : (100 * that.timeSpent / that.options.element.duration).toFixed(2);
        chrome.runtime.sendMessage({action: 'progression', progression: that.progressionPC});

        // Get/Concat AudioBuffer
        if (that.audioBuffer == null) {
          that.audioBuffer = e.inputBuffer;
        } else {
          that.audioBuffer = buffer.concatenateAudioBuffers(that.audioBuffer, e.inputBuffer);
        }
        if (that.audioBuffer.duration > 10) {
          that.arrayBuffer.push(that.audioBuffer);
          that.increment++;
          that.audioBuffer = null;
        }
      }
    }
  }

  listen () {
    console.log('listen');
    this.connect();
    var that = this;

    // On Pause on recording
    this.options.element.onpause = (e) => {
      console.log('onpause fired');
      global.allegro.audioContext.suspend();
      that.isAnalysing = false;
      that.options.element.onplay = function (e) {
        console.log('audioContext.resume');
        that.isAnalysing = true;
        global.allegro.audioContext.resume();
      }
    }


    // Listener
    storage.get(function(data) {
      console.log(data);
      // On Play if necessary
      if (data.onplay) {
        console.log('onplay event setted');
        that.options.element.onplay = (e) => {
          console.log('onplay fired');
          that.isAnalysing = true;
          that.listenAudioProcess();
        }
        // On Pause on recording
        that.options.element.onpause = (e) => {
          console.log('onpause fired');
          global.allegro.audioContext.suspend();
          that.isAnalysing = false;
          that.options.element.onplay = function (e) {
            console.log('audioContext.resume');
            global.allegro.audioContext.resume();
            that.isAnalysing = true;
            that.listenAudioProcess();
          }
        }

        if (that.options.element.playing || ! that.options.element.paused) {
          console.log('video auto played');
          that.isAnalysing = true;
          that.listenAudioProcess();
        } else {
          console.log('video not auto played');
        }
      }
    });


    // Analyse at End !
    this.options.element.onended = function (e) {
      console.log('onended fired');
      that.isAnalysing = false;
      var superBuffer = buffer.getSuperBuffer(that.increment, that.arrayBuffer);
      if (that.increment == 0) {
        console.log('increment equal zero');
        superBuffer = that.audioBuffer;
      }
      try {
        var bpmCandidates = BPM(superBuffer);
        var bpm = bpmCandidates[0].tempo;
        that.clear();

        // Get param v value
        var params = URL.getQueryParams(document.location.search);
        if (typeof(params.v) != 'undefined') {
          storage.storeResultInStorage(params.v, bpm);
          chrome.runtime.sendMessage({action: 'audio-analyzed', v: params.v, bpm: bpm, bpmCandidates: bpmCandidates});
          console.log(bpm);
        } else {
          console.log('No "v" data found in URL... Record cannot be stored !');
        }

        if (global.allegro.env == 'development') {
          console.log('pushState');
          var hash = Math.random().toString(36).slice(-8);
          var newPath = '/?v=' + hash;
          window.history.pushState({"pageTitle": hash}, "", newPath);
          document.title = hash;
          that.options.element.currentTime = 0;

          var eventRequest = new CustomEvent("spfrequest", { "detail": "Example of an event" });
          document.dispatchEvent(eventRequest);

          var wait = setTimeout(function () {
            var eventDone = new CustomEvent("spfdone", { "detail": "Example of an event" });
            document.dispatchEvent(eventDone);
            that.options.element.play();
          }, 300);
        }
      } catch (e) {
        console.log(e);
      }
    }

  }
}

module.exports = Recorder;