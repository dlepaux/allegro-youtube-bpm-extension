'use strict';

/**
 * Get HTMLAudio/Video Element
 * @return HTMLAudio/Video Element
 */
function getAudioElement() {
  return global.allegro.env == 'development' ? document.querySelector('audio') : document.querySelector('video');
}

module.exports = {
  getAudioElement: getAudioElement
};