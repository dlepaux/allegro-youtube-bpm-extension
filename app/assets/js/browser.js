'use strict';

var getOptions = function (callback) {
	chrome.storage.sync.get( function (data) {
      if ( typeof(data.options) === 'undefined' || data.options.length == 0) {
        data.options = null;
      }
      callback(data.options);
     });
}
var setOptions = function (options) {
	chrome.storage.sync.set({
      options: options
    }, function () {
      console.log('Sync succeed !');
    });
}

var defaultConfig = {
	display_mode: 'inline'
}

var onload = function (e) {
	// Init Version
	var extensionVersionAnchor = document.getElementById('extension-version');
	extensionVersionAnchor.innerHTML = 'v' + manifest.version;
	// Init Display Mode
	var options = getOptions( function (options) {
		if (options == null) {
			options = defaultConfig;
		}
		var radio = document.querySelector('input[type="radio"][name="display_mode"][value="' + options.display_mode + '"]');
		radio.checked = true;

		// Listener
		var radios = document.querySelectorAll('input[name="display_mode"]');
		for(var i = 0, max = radios.length; i < max; i++) {
			radios[i].onchange = function (e) {
				options.display_mode = e.target.getAttribute('value');
				setOptions(options);
			}
		}
	});
}