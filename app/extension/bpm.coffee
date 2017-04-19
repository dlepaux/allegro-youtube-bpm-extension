'use strict'

###
Forked from https://github.com/tornqvist/bpm-detective (thanks) at 2017-04-19 20:48
###

OfflineContext = (window.OfflineAudioContext || window.webkitOfflineAudioContext)

###
#* Detect BPM of a sound source
#* @param  {AudioBuffer} buffer Sound to process
#* @return {Promise}            Resolved to detected BPM
###

detect = (buffer) ->
  source = getLowPassSource buffer

  ###
  #* Schedule the sound to start playing at time:0
  ###

  source.start(0)

  ###
  #* Pipe the source through the program
  ###
  fnState = (state, fn) ->
    return fn(state)

  return [
    findPeaks,
    identifyIntervals,
    groupByTempo(buffer.sampleRate),
    getTopCandidate
  ].reduce(fnState, source.buffer.getChannelData(0))

###
#* Sort results by count and return top candidate
#* @param  {Object} Candidate
#* @return {Number}
###

getTopCandidate = (candidates) ->
  return candidates
    .sort((a, b) -> return b.count - a.count)
    .splice(0, 5)[0].tempo


###
#* Apply a low pass filter to an AudioBuffer
#* @param  {AudioBuffer}            buffer Source AudioBuffer
#* @return {AudioBufferSourceNode}
###

getLowPassSource = (buffer) ->
  length = buffer.length
  numberOfChannels = buffer.numberOfChannels
  sampleRate = buffer.sampleRate
  context = new OfflineContext(numberOfChannels, length, sampleRate)

  ###
  #* Create buffer source
  ###

  source = context.createBufferSource()
  source.buffer = buffer

  ###
  #* Create filter
  ###

  filter = context.createBiquadFilter()
  filter.type = 'lowpass'

  ###
  #* Pipe the song into the filter, and the filter into the offline context
  ###

  source.connect(filter)
  filter.connect(context.destination)

  return source

###
#* Find peaks in sampleRate
#* @param  {Array} data Bugger channel data
#* @return {Array}      Peaks found that are greater than the threshold
###

findPeaks = (data) ->
  peaks = []
  threshold = 0.9
  minThresold = 0.3
  minPeaks = 15

  ###
  #* Keep looking for peaks lowering the threshold until
  #* we have at least 15 peaks (10 seconds @ 90bpm)
  ###

  while peaks.length < minPeaks and threshold >= minThresold
    peaks = findPeaksAtThreshold(data, threshold)
    threshold -= 0.05


  ###
  #* Too fiew samples are unreliable
  ###

  if peaks.length < minPeaks
    throw new Error 'Could not find enough samples for a reliable detection.'

  return peaks


###
#* Function to identify peaks
#* @param  {Array}  data      Buffer channel data
#* @param  {Number} threshold Threshold for qualifying as a peak
#* @return {Array}            Peaks found that are grater than the threshold
###

findPeaksAtThreshold = (data, threshold) ->
  peaks = []

  ###
  #* Identify peaks that pass the threshold, adding them to the collection
  ###
  
  l = data.length
  i = 0
  while i < l
    if data[i] > threshold
      peaks.push i

      ###
      #* Skip forward ~ 1/4s to get past this peak
      ###

      i += 10000
    i += 1

  return peaks


###
#* Identify intervals between peaks
#* @param  {Array} peaks Array of qualified peaks
#* @return {Array}       Identifies intervals between peaks
###

identifyIntervals = (peaks) ->
  intervals = []

  peaks.forEach (peak, index) ->
    i = 0
    while i < 10
      interval = peaks[index + i] - peak

      ###
      #* Try and find a matching interval and increase it's count
      ###

      foundInterval = intervals.some intervalCount ->
        if intervalCount.interval == interval
          return intervalCount.count += 1

      ###
      #* Add the interval to the collection if it's unique
      ###

      if ! foundInterval
        intervals.push
          interval: interval
          count: 1
      i+= 1


  return intervals


###
#* Factory for group reducer
#* @param  {Number} sampleRate Audio sample rate
#* @return {Array}                Intervals grouped with similar values
###

groupByTempo = (sampleRate) ->

  ###
  #* Figure out best possible tempo candidates
  #* @param  {Array} intervalCounts List of identified intervals
  #* @return {Array}                Intervals grouped with similar values
  ###

  return (intervalCounts) ->
    tempoCounts = []

    intervalCounts.forEach intervalCount ->
      if intervalCount.interval != 0
        ###
        #* Convert an interval to tempo
        ###

        theoreticalTempo = 60 / (intervalCount.interval / sampleRate)

        ###
        #* Adjust the tempo to fit within the 90-180 BPM range
        ###

        while theoreticalTempo < 90 
          theoreticalTempo *= 2
        while theoreticalTempo > 180 
          theoreticalTempo /= 2

        ###
        #* Round to legible integer
        ###

        theoreticalTempo = Math.round theoreticalTempo

        ###
        #* See if another interval resolved to the same tempo
        ###

        foundTempo = tempoCounts.some tempoCount ->
          if tempoCount.tempo == theoreticalTempo
            return tempoCount.count += intervalCount.count

        ###
        #* Add a unique tempo to the collection
        ###

        if ! foundTempo
          tempoCounts.push
            tempo: theoreticalTempo
            count: intervalCount.count

    return tempoCounts

module.exports = detect