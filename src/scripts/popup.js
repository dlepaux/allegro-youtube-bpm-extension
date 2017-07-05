import ext from "./utils/ext";
import storage from "./utils/storage";
import allegro from "./allegro/allegro";

// Set Initial State
var state = "call-to-analyze";



////////////////////
//////////////////// DOM Modifier
////////////////////
/**
 * Update the button state (classNames, and variable)
 */
var buttonContainer = document.getElementById("display--buttons")
function updateButtonStateTo (newState) {
  buttonContainer.classList.remove('state-' + state);
  buttonContainer.classList.add('state-' + newState);
  state = newState;
}

/**
 * Progression Managment
 */
var progressionText = document.getElementById('progression-text');
var progressionBar = document.getElementById('progression-bar');
function updateProgression (percent) {
  progressionText.innerHTML = percent + ' %';
  progressionBar.style.width = percent + '%';
}

/**
 * Set Data for the last state on the chain (call-to-analyse => analyzing => analyzed !)
 */
function updateStateToAnalyzed (request) {
  updateButtonStateTo("analyzed");
  var bpmInner = document.getElementById('bpm');
  bpmInner.innerHTML = request.bpm + 'BPM';

}



////////////////////
//////////////////// Listeners
////////////////////
/**
 * Set EventListener on footer link with an anchor to target the right tab in option page
 */
var optionsLink = document.querySelectorAll(".js-options");
optionsLink.forEach(function(el) {
  el.addEventListener("click", function(e) {
    e.preventDefault();
    ext.tabs.create({'url': ext.extension.getURL('options.html') + el.getAttribute('href')});
  })
})

/**
 * Set listener on Call To Action
 */
var btnAnalyse = document.getElementById('call-to-action-btns');
btnAnalyse && btnAnalyse.addEventListener('click', function (e) {
  // State : Call to analyze
  if (state == "call-to-analyze") {
    ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'analyse-bpm' }, function (data) {
        updateButtonStateTo("analyzing");
      });
    });
  }

  // State Analyzing
  if (state == "analyzing") {
    ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'kill-analyze' }, function (data) {
        updateButtonStateTo("call-to-analyze");
      });
    });
  }

  // State Analyzed
  if (state == "analyzed") {

  }
});

/**
 * Listen onMessage Event (sent from contentscript.js)
 */
ext.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (request.action === 'progression') {
    updateProgression(request.progression);
  }
  if (request.action === 'audio-analyzed') {
    updateStateToAnalyzed(request);
  }
});



////////////////////
//////////////////// DOM Templating / Injection
////////////////////
var templateVideoDetected = (data) => {
  var json = JSON.stringify(data);
  return (`
    <div class="display--head grid">
      <div class="unit half video--detected">Vidéo détecté</div>
      <div class="unit half align-right video--origin text-grey-green">${data.origin}</div>
    </div>
    <div class="display--body grid no-float">
      <div class="unit half">
        <img src="https://i.ytimg.com/vi/${data.youtubeId}/default.jpg" width="117px" height="88px" alt="cover"/>
      </div>
      <div class="unit half video--details">
        <h3>${data.title}</h3>
        <p>${data.duration}</p>
        <p><strong>BPM </strong>${data.bpm}</p>
      </div>
    </div>
  `);
}




storage.get(function(dataStored) {
  var renderContent = (data) => {
    var displayContainer = document.getElementById("display--detected")

    if (data.hasAudio) {
      var welcomeContainer = document.getElementById("display--welcome")
      welcomeContainer.style.display = "none";
      displayContainer.style.display = "block";
      buttonContainer.style.display = "block";
    }

    if (data.isAnalysing) {
      updateButtonStateTo("analyzing");
    }

    data.bpm = typeof(dataStored.detectedVideos[data.youtubeId]) != 'undefined' ? dataStored.detectedVideos[data.youtubeId] : '?';
    var tmpl = templateVideoDetected(data);
    displayContainer.innerHTML = tmpl;
  }

  /**
   * Send page data on popin Loading !
   */
  ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderContent);
  });

  /**
   * Sync DOM Elements
   */
  var onPlaySwitch = document.getElementById('onplay');
  onPlaySwitch.checked = dataStored.onplay;
  onPlaySwitch.addEventListener('change', function (e) {
    var isChecked = this.checked;
    storage.set({ onplay: isChecked }, function () {
      console.log('done');
    });
  });
});