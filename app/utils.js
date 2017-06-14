'use strict' 

// Concat Two AudioBuffer togheter
function concatenateAudioBuffers (audioContext, buffer1, buffer2) {
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

  var tmp = audioContext.createBuffer(buffer1.numberOfChannels, buffer1.length + buffer2.length, buffer1.sampleRate);

  var i = 0;
  while (i < tmp.numberOfChannels) {
    data = tmp.getChannelData(i);
    data.set(buffer1.getChannelData(i));
    data.set(buffer2.getChannelData(i),buffer1.length);
    i++;
  }
  return tmp;
};


module.exports = {
  concatenateAudioBuffers: concatenateAudioBuffers
}
