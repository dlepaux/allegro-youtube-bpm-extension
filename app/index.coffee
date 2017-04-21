"use strict";

# Requires
getBPM = require './extension/bpm'
utils = require './utils'
m = require 'mithril'
j2c = require('j2c')()
style = require './extension/style'

# AudioContext
audioContext = new (window.AudioContext || window.webkitAudioContext)()
isInit = false

# AnimationFrame
lastTime = 0
vendors = ['ms', 'moz', 'webkit', 'o']
x = 0
while x < vendors.length and ! window.requestAnimationFrame
  window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
  window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] or window[vendors[x] + 'CancelRequestAnimationFrame']
  x++
if ! window.requestAnimationFrame
  window.requestAnimationFrame = (callback, element) ->
    currTime = new Date().getTime()
    timeToCall = Math.max(0, 16 - (currTime - lastTime))
    id = window.setTimeout(() ->
      callback(currTime + timeToCall)
    , timeToCall)
    lastTime = currTime + timeToCall
    return id
if ! window.cancelAnimationFrame
  window.cancelAnimationFrame = (id) ->
    clearTimeout(id)



class YoutubeBPM

  constructor: (@config) ->
    that = this

    # Defaults options
    chrome.storage.onChanged.addListener (changes, namespace) ->
      for key of changes
        if key == 'options'
          that.active = changes[key].newValue.active


    @options =
      active: true
    
    # Init variable
    @source
    @scriptNode
    @analyser
    @frequencyData
    @spfEventInitialized = false

    # Merge config
    cfg = @config ? {}
    @options[k] = cfg[k] for k of cfg



  # Get query params
  _getQueryParams: (qs) ->
    qs = qs.split('+').join(' ')
    params = {}
    tokens
    re = /[?&]?([^=]+)=([^&]*)/g
    while tokens = re.exec(qs)
        params[decodeURIComponent tokens[1] ] = decodeURIComponent tokens[2]
    return params

  _getDataStored: (callback) ->
    chrome.storage.sync.get (data) ->
      if typeof data.detectedVideos == 'undefined' || data.detectedVideos.length == 0
        data.detectedVideos = {}
      callback(data.detectedVideos)

  # Store BPMs in localStorage
  _storeResultInStorage: (id, bpm) ->
    @_getDataStored (data) ->
      console.log '_storeResultInStorage'
      console.log data
      # Check if already exist
      if ! data.hasOwnProperty(id)
        data[id] = bpm
        chrome.storage.sync.set({
          detectedVideos: data
        }, () ->
          console.log 'Sync succeed !'
        )
      else
        console.log 'This BPM has been already detected'

  # Get Buffer from arrayBuffer with current increment
  _getSuperBuffer: (increment, arrayBuffer) ->
    superBuffer = null
    i = 0
    while i < increment
      if superBuffer == null
        superBuffer = arrayBuffer[i]
      else
        superBuffer = utils.concatenateAudioBuffers audioContext, superBuffer, arrayBuffer[i]
      i++
    return superBuffer

  # Mithril Component
  # Styles
  sheet = j2c.sheet(style.css)
  _extentionBar: (HTMLVideoElement) ->
    that = this
    UI =

      isRecording: false
      percentageRecording: 0
      # Mount style to root 
      stylize: (element, sheet) ->
        element.type = 'text/css'
        if element.styleSheet
          element.styleSheet.cssText = sheet
        else
          element.appendChild(document.createTextNode(sheet))
        return element
      toggleactive: (e) ->
        e.stopPropagation()
        that.options.active = ! that.options.active
      detectBPM: (e = null) ->
        e?.stopPropagation()
        UI.isRecording = true
        # Reset video and start
        HTMLVideoElement.currentTime = 0
        HTMLVideoElement.play()
        duration = HTMLVideoElement.duration
        # OnAudioProcess
        arrayBuffer = []
        increment = 0
        countedDuration = 0
        
        connect = (HTMLVideoElement) ->
          audioBuffer = null
          that.scriptNode.onaudioprocess = (e) ->
            # Get/Concat AudioBuffer
            if audioBuffer == null
              audioBuffer = e.inputBuffer
            else
              audioBuffer = utils.concatenateAudioBuffers audioContext, audioBuffer, e.inputBuffer
            # Show PC
            countedDuration = countedDuration + e.inputBuffer.duration
            UI.percentageRecording = 100 * countedDuration / duration


            # Redraw
            #m.redraw()
            # Store AudioBuffer in array (memory issue)
            if audioBuffer.duration > 10
              arrayBuffer.push(audioBuffer)
              increment++
              #UI.currentBPM = getBPM(that._getSuperBuffer(increment, arrayBuffer))
              #console.log 'm.redraw()'
              #m.redraw()
              audioBuffer = null
            #console.log increment
        connect(HTMLVideoElement)

        # update
        update = () ->
          console.log 'update'
          requestAnimationFrame(update)
          m.redraw()
        update()

        params = that._getQueryParams(document.location.search)

        # Freeze Suspend audioContext on pause
        HTMLVideoElement.onpause = (e) ->
          if UI.isRecording
            audioContext?.suspend()
            HTMLVideoElement.onplay = (e) ->
              audioContext?.resume()
        # When video leave, detectBpm
        HTMLVideoElement.onended = (e) ->
          UI.isRecording = false
          superBuffer = that._getSuperBuffer(increment, arrayBuffer)

          try
            bpm = getBPM(superBuffer)
            that._storeResultInStorage(params.v, bpm)
            console.log('BPM is : ' + bpm);
          catch e
            console.log e

      # UI
      currentBPM: 0
      oncreate: (vnode) ->
        if that.options.active
          UI.detectBPM()
          UI.isRecording = true

      isChecked: (bool) ->
        if ! bool or bool == null or typeof(bool) == 'undefined'
          return ''
        else
          return '[checked="checked"]'
      
      disableIconMainClassName: () ->
        if UI.isRecording
          return ' ' + j2c.names['is-recording']
        return ''

      view: (vnode) ->
        #console.log j2c.names
        return [
          m 'style', oncreate: (vnode) ->
            UI.stylize vnode.dom, sheet
          m 'div', {class: j2c.names['line-height32']}, [
            #m 'span', {class: j2c.names['icon-ios-speedometer']}
            m 'div', {class: j2c.names.bars}, [
              (() ->
                that.analyser.getByteFrequencyData(that.frequencyData)
                bars = []
                i = 0
                while i < that.analyser.frequencyBinCount
                  bars.push(m('div', {class: j2c.names.bar}, m('div', {class: j2c.names.bar_inner, style: 'height: ' + (that.frequencyData[i] / 10) + 'px;'})))
                  i++
                return bars
              )()
              m 'div.clearfix'
            ]
          ]
        ]

  # Init and render UI
  _renderUIon: (HTMLVideoElement) ->
    console.log '_renderUIon'
    if ! document.getElementById 'mithril-root'
      # Init root node for mithril
      parent = document.querySelector('.ytp-chrome-bottom .ytp-right-controls')
      div = document.createElement 'div'
      div.id = 'mithril-root'
      div.className = j2c.names['mithril-root']
      parent.insertBefore div, parent.firstChild
    # Mount mithril
    m.mount document.getElementById('mithril-root'), @_extentionBar(HTMLVideoElement)

  # Listen Video, renderUI
  _watchVideo: (HTMLVideoElement) -> 
    # Listen ALL possible event on a HTML Video
    #("abort canplay canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart pause play playing ratechange seeked seeking stalled suspend volumechange waiting".split(' ')).forEach (e) ->
    #  HTMLVideoElement.addEventListener(e, () -> console.log e, false)
    # Events exluded
    # progress timeupdate
    # Render UI
    @_renderUIon(HTMLVideoElement)


  # Format of BPM in title
  _bpmTitleFormat: (bpm, title, clear = false) -> 
    if clear
      if title.match(/\<span\ class\=.*\<\/span\>\ \-\ /g)
        return title.replace(/\<span\ class\=.*\<\/span\>\ \-\ /g, "")
    else
      if ! title.match(/\<span\ class\=.*\<\/span\>\ \-\ /g)
        return '<span class="' + j2c.names['primary-color'] + '">[<span class="' + j2c.names['icon-circle'] + '"></span>' + bpm + '<span class="' + j2c.names['text-expose'] + '">BPM</span> ]' + '</span> - ' + title
    return title

  # Find and add all video title with [XXX BPM] <title>
  _addBPMinTitles: (clear = false) ->
    that = this
    @_getDataStored (data) ->
      # If data is not empty
      if Object.keys(data).length > 0 and data.constructor == Object
        # Check for current showed <video>
        params = that._getQueryParams(document.location.search)
        if data.hasOwnProperty(params.v)
          currentVideoTitle = document.getElementById('eow-title')
          if currentVideoTitle then currentVideoTitle.innerHTML = that._bpmTitleFormat(data[params.v], currentVideoTitle.innerHTML, clear)

        Object.keys(data).forEach (key) ->
          querySelectors = [
            'a[href*="/watch?v=' + key + '"] span.title'
            'a[href*="/watch?v=' + key + '"].yt-ui-ellipsis'
            'a[href*="/watch?v=' + key + '"].pl-video-title-link'
            'a[href*="/watch?v=' + key + '"].playlist-video h4.yt-ui-ellipsis'
          ]
          for selector in querySelectors
            video = document.querySelector(selector)
            if video != null
              video.innerHTML = that._bpmTitleFormat(data[key], video.innerHTML, clear)


  _bpmRibonFormat: (bpm, title, clear = false) ->
    if clear
      console.log 'clear'
    else
      return '<span class="' + j2c.names.ribon + '">' + bpm + '<br>BPM</span> - ' + title
    return title


  # Init extention
  init: () ->
    that = this

    if ! isInit
      chrome.storage.onChanged.addListener (changes, namespace) ->
        that._addBPMinTitles()
      isInit = true

    # If <video> found, init ui for recording
    youtubeVideo = document.querySelector 'video.html5-main-video'
    if youtubeVideo != null
      # Initialiaze @source, disconnect/connect
      if typeof(@source) == 'undefined'
        @source = audioContext.createMediaElementSource(youtubeVideo)
      else
        @source.disconnect(0)
        @scriptNode.disconnect(0)
      # ScriptNode
      @scriptNode = audioContext.createScriptProcessor(4096, 1, 1)
      @scriptNode.connect audioContext.destination
      # Analyser
      # Create analyser
      @analyser = audioContext.createAnalyser()
      @analyser.fftSize = 32 # ce parametre réduit l'échantillonage du son
      #@analyser.maxDecibels = -10 # règle la valeur maximum des frequences
      @analyser.connect(audioContext.destination)
      @frequencyData = new Uint8Array(@analyser.frequencyBinCount)
      # Source connects
      @source.connect @scriptNode
      @source.connect @analyser
      @source.connect audioContext.destination
      # RenderUI
      @_watchVideo(youtubeVideo)
    # Found and add each detected BPM on know video
    @_addBPMinTitles()

    # Youtube SPF Events
    # http://youtube.github.io/spfjs/documentation/events/
    if ! @spfEventInitialized
      @spfEventInitialized = true
      # Listener
      document.addEventListener "spfrequest", () ->
        console.log 'spf request'
        #audioContext?.suspend()
      , false
      document.addEventListener "spfdone", () ->
        #console.log 'spf done'
        that.init()
      , false


# Let's dooo iiiiit
#chrome.storage.local.clear()
youtubeBpmAnalyser = new YoutubeBPM()
youtubeBpmAnalyser.init()
