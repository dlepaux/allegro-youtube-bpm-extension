<p align="center">
  <p align="center">
    <img src="src/icons/icon-128.png" width=128 height=128>
  </p>

  <p align="center">
    <img src="src/images/shared/allegro-logo.png" width=283 height=97>
  </p>

  <p align="center">
    Simple and efficiency extension to analyse BPM/Tempo over youtube music videos.
  </p>
</p>

<br>

This extension is available on Chrome only for now... It permit to analyse and detect BPM on youtube music video ! Results are stored in the localStorage and showed in every visible title !


## <a name="installation"></a> Installation

1. Clone the repository `git clone https://github.com/EmailThis/extension-boilerplate.git`
2. Run `npm install`
3. Run `npm run build

Alternately, if you want to try out the sample extension, here are the download links. After you download it, unzip the file and load it in your browser using the steps mentioned below.
 - [**Download Chrome Extension**](https://github.com/EmailThis/extension-boilerplate/releases/download/v1.0/chrome.zip)
 - [**Download Opera Extension**](https://github.com/EmailThis/extension-boilerplate/releases/download/v1.0/opera.zip)
 - [**Download Firefox Extension**](https://github.com/EmailThis/extension-boilerplate/releases/download/v1.0/firefox.zip)


##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `extension-boilerplate/build/chrome` or (`extension-boilerplate/build/opera`)


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `extension-boilerplate/build/firefox`


## <a name="developing"></a> Developing

The following tasks can be used when you want to start developing the extension and want to enable live reload - 

- `npm run chrome-watch`
- `npm run opera-watch`
- `npm run firefox-watch`


## <a name="packaging"></a> Packaging
Run `npm run dist` to create a zipped, production-ready extension for each browser. You can then upload that to the appstore.


## TODO
- [ ] Add support for Safari
- [x] Add Firefox & Opera Promo images
- [x] Add sample screenshot templates
- [ ] Write a guide for using config variables & JS preprocessor

## <a name="contributing"></a> Contributing

Pull requests are welcome. If you add functionality, then please add unit tests to cover it.

## <a name="credits"></a> Credits

Thanks to Carl Törnqvist for his `https://github.com/tornqvist/bpm-detective` package
Thanks to EmailThis for his amazing boilerplate `https://github.com/EmailThis/extension-boilerplate`

## <a name="licence"></a> Licence

The MIT License (MIT)

Copyright (c) 2017 David Lepaux

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
