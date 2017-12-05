'use strict';





(function () {
  // Future-proofing...
  // https://developer.mozilla.org/en/docs/Web/API/AudioContext
  var context;
  if (typeof AudioContext !== "undefined") {
      context = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
      context = new webkitAudioContext();
  }


  // Concat Two AudioBuffer togheter
  function concatenateAudioBuffers (buffer1, buffer2) {
    if (! buffer1 || ! buffer2) {
      console.log("no buffers!");
      return null;
    }

    if (buffer1.numberOfChannels != buffer2.numberOfChannels) {
      console.log("number of channels is not the same!");
      return null;
    }

    if (buffer1.sampleRate != buffer2.sampleRate) {
      console.log("sample rates don't match!");
      return null;
    }

    var tmp = context.createBuffer(buffer1.numberOfChannels, buffer1.length + buffer2.length, buffer1.sampleRate);

    var i = 0;
    while (i < tmp.numberOfChannels) {
      var data = tmp.getChannelData(i);
      data.set(buffer1.getChannelData(i));
      data.set(buffer2.getChannelData(i),buffer1.length);
      i++;
    }
    return tmp;
  };

  // Get Buffer from arrayBuffer with current increment
  function getSuperBuffer (arrayBuffer) {
    var superBuffer = null;
    var i = 0;
    console.log(arrayBuffer.length);
    while (i < arrayBuffer.length) {
      if (superBuffer == null) {
        superBuffer = arrayBuffer[i];
      } else {
        superBuffer = concatenateAudioBuffers(superBuffer, arrayBuffer[i]);
      }
      i++;
    }
    return superBuffer;
  }

  // Apply a low pass filter to an AudioBuffer
  var OfflineContext = (window.OfflineAudioContext || window.webkitOfflineAudioContext);
  function getLowPassSource(buffer) {
    var length = buffer.length, numberOfChannels = buffer.numberOfChannels, sampleRate = buffer.sampleRate;
    var context = new OfflineContext(numberOfChannels, length, sampleRate);

    /**
     * Create buffer source
     */

    var source = context.createBufferSource();
    source.buffer = buffer;

    /**
     * Create filter
     */

    var filter = context.createBiquadFilter();
    filter.type = 'lowpass';

    /**
     * Pipe the song into the filter, and the filter into the offline context
     */

    source.connect(filter);
    filter.connect(context.destination);

    return source;
  }


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

  // Get button controllers
  var controlFFT = document.getElementById('control-FFT');
  var isFFTChecked = controlFFT.checked;
  var controlPCM = document.getElementById('control-PCM');
  var isPCMChecked = controlPCM.checked;
  controlFFT.addEventListener('change', function (e) {
    isFFTChecked = ! isFFTChecked;
  }, true);
  controlPCM.addEventListener('change', function (e) {
    isPCMChecked = ! isPCMChecked;
  }, true);
  var isAnalysis = false;



  // Create the analyser
  var analyser = context.createAnalyser();
  analyser.fftSize = 4096;
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);

  // Create the script node
  var scriptNode = context.createScriptProcessor(2048, 1, 1);

  // Set up the visualisation elements
  var visualisation = document.getElementById("visualisation");
  var barSpacingPercent = 100 / analyser.frequencyBinCount;
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var fragment = document.createDocumentFragment();
    var div = document.createElement('div');
    div.style.left = i * barSpacingPercent + "%";
    fragment.appendChild(div);
    visualisation.appendChild(fragment);
  }
  var bars = document.querySelectorAll("#visualisation > div");

  // Get the frequency data and update the visualisation
  function update() {
      if (isFFTChecked && isAnalysis) {
        requestAnimationFrame(update);
      }

      analyser.getByteFrequencyData(frequencyData);

      var i = 0, barLength = bars.length;
      while (i < barLength) {
        bars[i].style.height = frequencyData[i] + 'px';
        i++;
      }
  };

  // Hook up the audio routing...
  // player -> analyser -> speakers
  // (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
  var player = document.getElementById("player");
  var source = context.createMediaElementSource(player);
  var originalArrayBuffer = [];
  var lowPassedArrayBuffer = [];
  var fragment = document.createDocumentFragment();


  function printPCMDatas (id, arrayBuffer, chunkBychunk) {
    // Prepare PCM visualizer
    var visualisationPCM = document.getElementById(id);
    var barSpacingPercent = 100 / analyser.frequencyBinCount / arrayBuffer.length; //// 0.048828 = 100 / 2048
    var inputBuffer;
    // If we want to append chunk by chunk or not
    if (chunkBychunk) {
      inputBuffer = arrayBuffer;
    } else {
      inputBuffer = getSuperBuffer(arrayBuffer);
    }
    console.log('arrayBuffer', arrayBuffer);
    console.log('inputBuffer', inputBuffer);

    // var lengthArrayBuffer = chunkBychunk ? 1 : arrayBuffer.length;
    ///*
    var data = inputBuffer.getChannelData(0);
    console.log('data', data);

    var container = document.createElement('div');
    container.className = 'chunk-container';
    container.style.position = 'relative';
    container.style.float = 'left';
    container.style.width = visualisationPCM.offsetWidth + 'px';
    container.style.height = '200px';
    for (var i = 0; i < analyser.frequencyBinCount * arrayBuffer.length; i++) {
      var div = document.createElement('div');
      div.style.left = i * barSpacingPercent + "%";
      // console.log(data[i]);
      div.style.height = (200 * (data[i] + 1) / 2) + 'px';
      container.appendChild(div);
    }
    fragment.appendChild(container);

    visualisationPCM.style.width = (counterChunk * visualisationPCM.offsetWidth + 10)  + 'px';
    visualisationPCM.appendChild(fragment);

    //*/

    // Show data
    /*var barsPCM = document.querySelectorAll("#" + id + " > div");
    console.log('barsPCM', barsPCM);
    console.log('data.length', data.length);
    var i = 0, barLength = data.length;
    while (i < barLength) {
      barsPCM[i].style.height = (200 * (data[i] + 1) / 2) + 'px';
      i++;
    }*/
  };

  var counterChunk = 0;
  player.onplay = function() {
    console.log('oncanplay');
    isAnalysis = true;
    source.connect(analyser);
    analyser.connect(context.destination);

    scriptNode.connect(context.destination);
    source.connect(scriptNode);



    // Animate it
    scriptNode.onaudioprocess = function (e) {
      //console.log('onaudioprocess');
      counterChunk++;

      // Store buffer (chunk)
      if (originalArrayBuffer.length < 2) {
        console.log('push');
        originalArrayBuffer.push(e.inputBuffer);
      }

      if (lowPassedArrayBuffer.length < 2) {
        // Apply a lowPass Filter on the buffer, concat it together and print it finally at end
        var sourceBuffer = getLowPassSource(e.inputBuffer);
        // sourceBuffer.start(0);
        lowPassedArrayBuffer.push(sourceBuffer.buffer);
      }


    }

    // update();
  };

  player.onended = function () {
    printPCMDatas('visualisation-pcm-original', originalArrayBuffer);
    printPCMDatas('visualisation-pcm-lowpass', lowPassedArrayBuffer);

    // Disconnect
    source.disconnect(analyser);
    analyser.disconnect(context.destination);
    source.disconnect(scriptNode);
    scriptNode.disconnect(context.destination);

    // Rest..
    source.disconnect();

    // Concat Buffers
    // printPCMDatas('visualisation-pcm-original', originalArrayBuffer);

    // printPCMDatas('visualisation-pcm-lowpass', lowPassedArrayBuffer);

    // Reset
    isAnalysis = false;
    //lowPassedArrayBuffer = [];
    //originalArrayBuffer = [];
  }

  player.onpause = function () {
    console.log('onended');
    // Disconnect
    source.disconnect(analyser);
    analyser.disconnect(context.destination);
    source.disconnect(scriptNode);
    scriptNode.disconnect(context.destination);

    // Rest..
    source.disconnect();

    // Concat Buffers
    // printPCMDatas('visualisation-pcm-original', originalArrayBuffer);


    // printPCMDatas('visualisation-pcm-lowpass', lowPassedArrayBuffer);

    // Reset
    isAnalysis = false;
    //lowPassedArrayBuffer = [];
    // originalArrayBuffer = [];
  }



  // Kick it off...
  //
})();