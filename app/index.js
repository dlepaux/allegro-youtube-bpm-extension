"use strict";

// Requires
var getBPM = require('./extension/bpm');
var utils = require('./utils');
var m = require('mithril');
var j2c = require('j2c')();
var style = require('./extension/style');

// AudioContext
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var isInit = false;

// Overkill - if we've got Web Audio API, surely we've got requestAnimationFrame. Surely?...
// requestAnimationFrame polyfill by Erik M�ller
// fixes from Paul Irish and Tino Zijdel
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () { callback(currTime + timeToCall); },
            timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };



class YoutubeBPM {

  constructor(this.config) {
    var that = this;

    // Defaults options
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      for (var key of changes) {
        if (key == 'options') {
          that.active = changes[key].newValue.active;
        }
      }
    });


    this.options = {
      active: true
    }
    
    // Init variable
    this.source
    this.scriptNode
    this.analyser
    this.frequencyData
    this.frequencyFloatData
    this.spfEventInitialized = false

    // Merge config
    var cfg = this.config || {};
    this.options = Object.assign(this.options, cfg);
  }



  // Get query params
  _getQueryParamsfunction (qs) {
    qs = qs.split('+').join(' ')
    params = {}
    tokens
    re = /[?&]?([^=]+)=([^&]*)/g
    while tokens = re.exec(qs)
        params[decodeURIComponent tokens[1] ] = decodeURIComponent tokens[2]
    return params
  }

  _getDataStored (callback) {
    chrome.storage.sync.get(function (data) {
      if (typeof(data.detectedVideos) == 'undefined' || data.detectedVideos.length == 0) {
        data.detectedVideos = {};
      }
      callback(data.detectedVideos);
    });
  }

  // Store BPMs in localStorage
  _storeResultInStorage (id, bpm) {
    this._getDataStored( function (data) {
      console.log('_storeResultInStorage');
      console.log(data);
      // Check if already exist
      if (! data.hasOwnProperty(id)) {
        data[id] = bpm
        chrome.storage.sync.set({
          detectedVideos: data
        }, function () {
          console.log('Sync succeed !');
        });
      } else {
        console.log('This BPM has been already detected');
      }
    }
  }

  // Get Buffer from arrayBuffer with current increment
  _getSuperBuffer (increment, arrayBuffer) {
    var superBuffer = null;
    var i = 0;
    while (i < increment) {

      if (superBuffer == null) {
        superBuffer = arrayBuffer[i];
      } else {
        superBuffer = utils.concatenateAudioBuffers(audioContext, superBuffer, arrayBuffer[i]);
      }
      i++;
    }
    return superBuffer
  }

  // Mithril Component
  // Styles
  this.sheet = j2c.sheet(style.css);
  _extentionBar (HTMLVideoElement) {
    that = this;
    UI = {
      isRecording: false,
      percentageRecording: 0,
      // Mount style to root 
      stylize: function (element, sheet) {
        element.type = 'text/css';
        if (element.styleSheet) {
          element.styleSheet.cssText = sheet;
        } else {
          element.appendChild(document.createTextNode(sheet));
        }
        return element;
      },
      toggleactive: function (e)  {
        e.stopPropagation();
        that.options.active = ! that.options.active;
      }
      detectBPM: function (e = null) {
        e && e.stopPropagation();
        UI.isRecording = true;
        // Reset video and start
        HTMLVideoElement.currentTime = 0;
        HTMLVideoElement.play();
        var duration = HTMLVideoElement.duration;
        // OnAudioProcess
        var arrayBuffer = [];
        var increment = 0;
        //countedDuration = 0
        
        var connect = function (HTMLVideoElement) {
          audioBuffer = null;
          that.scriptNode.onaudioprocess = function (e) {
            // Get/Concat AudioBuffer
            if (audioBuffer == null) {
              audioBuffer = e.inputBuffer;
            } else {
              audioBuffer = utils.concatenateAudioBuffers(audioContext, audioBuffer, e.inputBuffer);
            }
            // Show PC
            //countedDuration = countedDuration + e.inputBuffer.duration
            //UI.percentageRecording = 100 * countedDuration / duration



            // Redraw
            //m.redraw()
            // Store AudioBuffer in array (memory issue)
            if (audioBuffer.duration > 10) {
              console.log 'e.inputBuffer'
              console.log e.inputBuffer
              arrayBuffer.push(audioBuffer)
              increment++
              //UI.currentBPM = getBPM(that._getSuperBuffer(increment, arrayBuffer))
              //console.log 'm.redraw()'
              //m.redraw()
              audioBuffer = null
            }
            //console.log increment
          }
        }
        connect(HTMLVideoElement);

        // update
        var update = function () {
          //console.log 'update'
          if (UI.isRecording) {
            requestAnimationFrame(update);
            m.redraw();
          }
        }
        update();

        params = that._getQueryParams(document.location.search);

        // Freeze Suspend audioContext on pause
        HTMLVideoElement.onpause = function (e) {
          if (UI.isRecording) {
            audioContext?.suspend();
            HTMLVideoElement.onplay = function (e) {
              audioContext?.resume();
            }
          }
        }
        // When video leave, detectBpm
        HTMLVideoElement.onended = function (e) {
          UI.isRecording = false;
          superBuffer = that._getSuperBuffer(increment, arrayBuffer);
          try () {
            var bpm = getBPM(superBuffer);
            that._storeResultInStorage(params.v, bpm);
            console.log('BPM is : ' + bpm);
          } catch (e) {
            console.log(e);
          }
        }
      },

      // UI
      currentBPM: 0,
      oncreate: function (vnode) {
        if (that.options.active) {
          UI.detectBPM();
          UI.isRecording = true;
        }
      },
      isChecked: function (bool) {
        if (! bool or bool == null or typeof(bool) == 'undefined') {
          return '';
        } else {
          return '[checked="checked"]';
        }
      },
      disableIconMainClassName: function () {
        if (UI.isRecording) {
          return ' ' + j2c.names['is-recording'];
        }
        return ''
      },
      view: function (vnode) {
        return [
          m('style', oncreate: function (vnode) {
            UI.stylize(vnode.dom, sheet);
          }),
          m('div', {class: j2c.names['line-height32']}, [
            //m 'span', {class: j2c.names['icon-ios-speedometer']}
            m('div', {class: j2c.names.bars}, [
              (function () {
                that.analyser.getByteFrequencyData(that.frequencyData);
                that.analyser.getFloatFrequencyData(that.frequencyFloatData);
                console.log(that.frequencyData);
                console.log(that.frequencyFloatData);
                var bars = [];
                var i = 0;
                while (i < that.analyser.frequencyBinCount) {
                  bars.push(m('div', {class: j2c.names.bar}, m('div', {class: j2c.names.bar_inner, style: 'height: ' + (that.frequencyData[i] / 10) + 'px;'})));
                  i++;
                }
                return bars;
              })(),
              m('div.clearfix')
            ])
          ])
        ];
      }
    }
  }

  // Init and render UI
  _renderUIon (HTMLVideoElement) {
    console.log('_renderUIon');
    if (! document.getElementById('mithril-root')) {
      // Init root node for mithril
      var parent = document.querySelector('.ytp-chrome-bottom .ytp-right-controls');
      var div = document.createElement('div');
      div.id = 'mithril-root';
      div.className = j2c.names['mithril-root'];
      parent.insertBefore(div, parent.firstChild);
    }
    // Mount mithril
    m.mount(document.getElementById('mithril-root'), @_extentionBar(HTMLVideoElement));
  }

  // Listen Video, renderUI
  _watchVideo (HTMLVideoElement) {
    // Listen ALL possible event on a HTML Video
    //("abort canplay canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart pause play playing ratechange seeked seeking stalled suspend volumechange waiting".split(' ')).forEach (e) ->
    //  HTMLVideoElement.addEventListener(e, () -> console.log e, false)
    // Events exluded
    // progress timeupdate
    // Render UI
    @_renderUIon(HTMLVideoElement)
  }


  // Format of BPM in title
  _bpmTitleFormat (bpm, title, clear = false) {
    if (clear) {
      if (title.match(/\<span\ class\=.*\<\/span\>\ \-\ /g)) {
        return title.replace(/\<span\ class\=.*\<\/span\>\ \-\ /g, "");
      }
    } else {
      if (! title.match(/\<span\ class\=.*\<\/span\>\ \-\ /g)) {
        return '<span class="' + j2c.names['primary-color'] + '">[<span class="' + j2c.names['icon-circle'] + '"></span>' + bpm + '<span class="' + j2c.names['text-expose'] + '">BPM</span> ]' + '</span> - ' + title;
      }
    }
    return title
  }

  // Find and add all video title with [XXX BPM] <title>
  _addBPMinTitles (clear = false) {
    var that = this;
    this._getDataStored( function (data) {

      // If data is not empty
      if (Object.keys(data).length > 0 && data.constructor == Object) {
        // Check for current showed <video>
        var params = that._getQueryParams(document.location.search);
        if (data.hasOwnProperty(params.v)) {
          currentVideoTitle = document.getElementById('eow-title');
          if (currentVideoTitle) currentVideoTitle.innerHTML = that._bpmTitleFormat(data[params.v], currentVideoTitle.innerHTML, clear);
        }

        Object.keys(data).forEach( function (key) {

          querySelectors = [
            'a[href*="/watch?v=' + key + '"] span.title',
            'a[href*="/watch?v=' + key + '"].yt-ui-ellipsis',
            'a[href*="/watch?v=' + key + '"].pl-video-title-link',
            'a[href*="/watch?v=' + key + '"].playlist-video h4.yt-ui-ellipsis'
          ];
          for (var selector in querySelectors) {
            var video = document.querySelector(selector)
            if (video != null) {
              video.innerHTML = that._bpmTitleFormat(data[key], video.innerHTML, clear);
            }
          }
        });
      }
    }
  }


  _bpmRibonFormat (bpm, title, clear = false) {
    if (clear) {
      console.log('clear');
    } else {
      return '<span class="' + j2c.names.ribon + '">' + bpm + '<br>BPM</span> - ' + title;
    }
    return title;
  }


  // Init extention
  init () {
    var that = this;

    if (! isInit) {
      chrome.storage.onChanged.addListener( function (changes, namespace) {
        that._addBPMinTitles();
      });
      isInit = true;
    }

    // If <video> found, init ui for recording
    var youtubeVideo = document.querySelector('video.html5-main-video');
    if (youtubeVideo != null) {

      // Initialiaze @source, disconnect/connect
      if (typeof(this.source) == 'undefined') {
        this.source = audioContext.createMediaElementSource(youtubeVideo);
      } else {
        this.source.disconnect(0);
        this.scriptNode.disconnect(0);
      }
      // ScriptNode
      this.scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptNode.connect(audioContext.destination);
      // Analyser
      // Create analyser
      this.analyser = audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // ce parametre réduit l'échantillonage du son
      //this.analyser.maxDecibels = -10 // règle la valeur maximum des frequences
      this.analyser.connect(audioContext.destination);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.frequencyFloatData = new Float32Array(this.analyser.frequencyBinCount);
      // Source connects
      this.source.connect(this.scriptNode);
      this.source.connect(this.analyser);
      this.source.connect(audioContext.destination);
      // RenderUI
      @_watchVideo(youtubeVideo);
    }
    // Found and add each detected BPM on know video
    @_addBPMinTitles();

    // Youtube SPF Events
    // http://youtube.github.io/spfjs/documentation/events/
    if (! this.spfEventInitialized) {
      this.spfEventInitialized = true;
      // Listener
      document.addEventListener("spfrequest", function () {
        console.log('spf request');
        //audioContext?.suspend()
      }, false)
      document.addEventListener("spfdone", function () {
        //console.log 'spf done'
        that.init();
      }, false)
    }
  }
}

// Let's dooo iiiiit
//chrome.storage.local.clear()
youtubeBpmAnalyser = new YoutubeBPM();
youtubeBpmAnalyser.init();
