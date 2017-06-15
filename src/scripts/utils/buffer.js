'use strict'

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

  var tmp = global.allegro.audioContext.createBuffer(buffer1.numberOfChannels, buffer1.length + buffer2.length, buffer1.sampleRate);

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
function getSuperBuffer (increment, arrayBuffer) {
  var superBuffer = null;
  var i = 0;
  while (i < increment) {

    if (superBuffer == null) {
      superBuffer = arrayBuffer[i];
    } else {
      superBuffer = concatenateAudioBuffers(superBuffer, arrayBuffer[i]);
    }
    i++;
  }
  return superBuffer;
}


module.exports = {
  concatenateAudioBuffers: concatenateAudioBuffers,
  getSuperBuffer: getSuperBuffer
}
