'use strict';

import storage from "./../utils/storage";
import utils from "./../utils/buffer";
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
    this.increment = null;
    this.audioBuffer = null;
    this.superBuffer = null;
    this.arrayBuffer = [];
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
  }

  listenAudioProcess () {
    console.log('listenAudioProcess');
    this.audioBuffer = null;
    this.increment = 0;
    var that = this;
    this.scriptNode.onaudioprocess = function (e) {
      console.log('onaudioprocess running !');
      // Get/Concat AudioBuffer
      if (that.audioBuffer == null) {
        that.audioBuffer = e.inputBuffer;
      } else {
        that.audioBuffer = utils.concatenateAudioBuffers(that.audioBuffer, e.inputBuffer);
      }
      if (that.audioBuffer.duration > 10) {
        that.arrayBuffer.push(that.audioBuffer);
        that.increment++;
        that.audioBuffer = null;
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
      that.options.element.onplay = function (e) {
        console.log('audioContext.resume');
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
          that.listenAudioProcess();
        }
        // On Pause on recording
        that.options.element.onpause = (e) => {
          console.log('onpause fired');
          global.allegro.audioContext.suspend();
          that.options.element.onplay = function (e) {
            console.log('audioContext.resume');
            global.allegro.audioContext.resume();
            that.listenAudioProcess();
          }
        }

      }
    });


    // Analyse at End !
    this.options.element.onended = function (e) {
      console.log('onended fired');

      var superBuffer = utils.getSuperBuffer(that.increment, that.arrayBuffer);
      if (that.increment == 0) {
        console.log('increment equal zero');
        superBuffer = that.audioBuffer;
      }
      try {
        var bpm = BPM(superBuffer);
        console.log('BPM is : ' + bpm);
        that.clear();

        // Get param v value
        var params = URL.getQueryParams(document.location.search);
        if (typeof(params.v) != 'undefined') {
          storage.storeResultInStorage(params.v, bpm);
          console.log(bpm);
        } else {
          console.log('No "v" data found in URL... Record cannot be stored !');
        }
      } catch (e) {
        console.log(e);
      }
    }

  }
}


module.exports = Recorder;