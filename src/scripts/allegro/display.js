'use strict';

import URL from './url';

/**
 * Display BPM in every 'title' or other 'text' for each recorded sound
 */
class Display {

  /**
   * Constructor
   * @param  {Array} data  Required, contain objects with key = id, value = bpm
   */
  constructor(data) {
    // Dependencies :
    /** //j2c
      'primary-color'
      'icon-circle'
      'text-expose'
    */
    this.data = data;
  }

  /**
   * Add the BPM before the title text
   * @param  {Integer}  bpm   Value of tempo
   * @param  {String}  title  InnerHTML of the title node
   * @param  {Boolean} clear  Default to false, permit to restore title
   * @return {String}         Title with the BPM at first :)
   */
  _bpmTitleFormat (bpm, title, clear = false) {
    if (clear) {
      if (title.match(/\<span\ class\=.*\<\/span\>\ \-\ /g)) {
        return title.replace(/\<span\ class\=.*\<\/span\>\ \-\ /g, "");
      }
    } else {
      if (! title.match(/\<span\ class\=.*\<\/span\>\ \-\ /g)) {
        return '<span class="' + global.allegro.j2c.names['primary-color'] + '">[<span class="' + global.allegro.j2c.names['icon-circle'] + '"></span>' + bpm + '<span class="' + global.allegro.j2c.names['text-expose'] + '">BPM</span>]' + '</span> - ' + title;
      }
    }
    return title;
  }


  /**
   * Check DOM to find title nodes (a:link with the video ID, and specific querySelectors)
   * @param {Boolean} clear  Default to false, permit to restore title
   */
  addBPMinTitles (clear = false) {
    console.log('addBPMinTitles !');
    if (global.allegro.env != 'production') console.log('start addBPM');
    var that = this;
    // If data is not empty
    if (Object.keys(this.data).length > 0 && this.data.constructor == Object) {
      // Check for current showed <video>
      var params = URL.getQueryParams(document.location.search);
      if (this.data.hasOwnProperty(params.v)) {
        var currentVideoTitle = document.getElementById('eow-title');
        if (currentVideoTitle) currentVideoTitle.innerHTML = this._bpmTitleFormat(this.data[params.v], currentVideoTitle.innerHTML, clear);
      }
      // Check for each videos recorded
      Object.keys(this.data).forEach( function (key) {
        var querySelectors = [
          'a[href*="/watch?v=' + key + '"] span.title',
          'a[href*="/watch?v=' + key + '"].yt-ui-ellipsis',
          'a[href*="/watch?v=' + key + '"].pl-video-title-link',
          'a[href*="/watch?v=' + key + '"].playlist-video h4.yt-ui-ellipsis'
        ];
        for (var i in querySelectors) {
          var selector = querySelectors[i];
          var video = document.querySelector(selector);
          if (video != null) {
            video.innerHTML = that._bpmTitleFormat(that.data[key], video.innerHTML, clear);
          }
        }
      });
    }
    if (global.allegro.env != 'production') console.log('end addBPM');
  }

  /**
   * Update BPM in each visible title
   * @param  {Array} data  Contain objects with key = id, value = bpm
   */
  update (data) {
    console.log('update title !');
    this.data = data;
    this.addBPMinTitles();
  }
}

module.exports = Display