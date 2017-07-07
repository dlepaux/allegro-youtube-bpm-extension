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

This extension is available on (dev mode) Chrome, Firefox and Opera. It permit to analyse and detect BPM on youtube music video ! Results are stored in the extension memory and showed in every visible title !


## <a name="installation"></a> Installation

1. Clone the repository `git clone https://github.com/dlepaux/allegro-youtube-bpm-extension.git`
2. Run `npm install`
3. Run `npm run build

## <a name="developing"></a> Developing

The following tasks can be used when you want to start developing the extension and want to enable live reload - 

- `npm run chrome-watch`
- `npm run opera-watch`
- `npm run firefox-watch`


## <a name="packaging"></a> Packaging
Run `npm run dist` to create a zipped, production-ready extension for each browser. You can then upload that to the appstore.


## TODO
- [ ] Add support for Safari
- [ ] Add Chrome, Firefox & Opera Promo images
- [ ] Add sample screenshot templates
- [ ] Convert native DOM with React / Mithril

## <a name="contributing"></a> Contributing
Pull requests are welcome. If you add functionality, then please add unit tests to cover it.

## <a name="credits"></a> Credits

Thanks to Carl Törnqvist for his `https://github.com/tornqvist/bpm-detective` package

Thanks to EmailThis for his amazing extension boilerplate `https://github.com/EmailThis/extension-boilerplate`

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
