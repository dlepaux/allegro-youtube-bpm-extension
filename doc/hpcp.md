## HPCP Feature extraction procedure

- 1 - Input musical signal
```coffee
# Get a new AudioContext instance from browser
# The AudioContext is the studio where everything lives
# (https://developer.mozilla.org/fr/docs/Web/API/AudioContext)
audioContext = new (window.AudioContext || window.webkitAudioContext)()
```

- 2 - Do **spectral analysis** to obtain the frequency components of the music signal.
```coffee
# Get a new AnalyserNode instance
# (https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
analyser = audioContext.createAnalyser()
analyser.fftSize = 2048
frequencyData = new Uint8Array(analyser.frequencyBinCount) # Declare a new empty Uint8Array
```

- 3 - Use **Fourier transform** to convert the signal into a spectrogram. (The Fourier transform is a type of **time-frequency analysis**.)
```coffee
# Example with a complete NodeScript implementation
```

- 4 - Do **frequency filtering**. A frequency range of between 100 and 5000 Hz is used.
```coffee
# Get a new BiquadFilterNode
# (https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/BiquadFilterNode)
# LowPass Filter
biquadLowPassFilter = audioContext.createBiquadFilter()
biquadLowPassFilter.type = "lowpass"
biquadLowPassFilter.frequency.value = 5000
# HighPass Filter
biquadHighPassFilter = audioContext.createBiquadFilter()
biquadHighPassFilter.type = "highpass"
biquadHighPassFilter.frequency.value = 100
```

- 5 - Do **peak detection**. Only the local maximum values of the spectrum are concidered.

Try with `npm install --save peak-finding` OR `npm install ml-matrix-peaks-finder`

```coffee
peakFinding = require 'peak-finding'
peakFinding([1, 3, 4, 3, 5, 1, 3]) #=> 4 
```

- 6 - Do **reference frequency computation** procedure. Estimate the **deviation** with respect to 440 Hz.
Try with `npm install detect-pitch`(from signal) OR `npm install pitch-detect`(from mediaStream)
```
# Stuff...
```

- 7 - Do **Pitch class mapping** with respect to the estimated reference frequency. This is a procedure for determining the pitch class value from frequency values. A weighting scheme with cosine function is used. It considers the presence of harmonic frequencies (harmonic summation procedure), taking account a total of 8 harmonics for each frequency. To map the value on a one-third of a semitone, the size of the pitch class distribution vectors must be equal to **36**.

`Help to bertrand`


- 8 - **Normalize** the feature frame by frame dividing through the maximum value to eliminate dependency on global loudness. 


