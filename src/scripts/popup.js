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
function updateBPM (bpm) {
  var bpmInner = document.getElementById('bpm');
  bpmInner.innerHTML = bpm + 'BPM';
}
function closeBPMCandidateDialog () {
  document.querySelector('.bpm-candidates').style.display = 'none';
}
function updateStateToAnalyzed (request) {
  updateButtonStateTo("analyzed");
  updateBPM(request.bpm);
  // Feed bpm candidates
  var templateCandidates = '<ul>';
  for (var o in request.bpmCandidates) {
    var startLi = '<li>';
    if (o == 0) {
      startLi = '<li class="active">';
    }
    templateCandidates += startLi + '<span class="head">' + (parseInt(o) + 1) + '</span><span class="count">' + request.bpmCandidates[o].count + 'x</span><span class="tempo">' + request.bpmCandidates[o].tempo + '</span></li>';
  }
  templateCandidates += '</ul><div class="clearfix"></div>';
  var bpmCandidatesContainer = document.getElementById('bpm-candidates');
  bpmCandidatesContainer.innerHTML = templateCandidates;
  // Listen submit
  var buttonUpdateBPM = document.getElementById('submit-bpm-update');
  buttonUpdateBPM.addEventListener('click', function (e) {
    var bpm = document.querySelector('#bpm-candidates li.active span.tempo').innerHTML;
    updateBPM(bpm);
    ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'update-bpm', v: request.v, bpm: bpm}, function (data) {
        closeBPMCandidateDialog();
        buttonUpdateBPM.removeEventListener('click');
      });
    });
  });
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
 * Set Listenerfor bpmCandidate Dialog
 */
var closeBpmCandidate = document.querySelector('.bpm-candidates .close');
closeBpmCandidate.addEventListener('click', closeBPMCandidateDialog);

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
});

var btnContainer = document.getElementById('display--buttons');
btnContainer && btnContainer.addEventListener('click', function (e) {
  // State Analyzed
  if (state == "analyzed") {
    // Show BPM Candidate dialog
    var bpmCandidatesContainer = document.getElementById('bpm-candidates');
    bpmCandidatesContainer.parentNode.style.display = 'block';
    var bpmCandidatesElements = document.querySelectorAll('#bpm-candidates ul li');
    bpmCandidatesElements.forEach(function (el) {
      el.addEventListener("click", function (e) {
        // Reset active flag
        bpmCandidatesElements.forEach(function (element) {
          element.classList.remove('active');
        });
        // Set active
        el.classList.add('active');
        // Update with right BPM
        for (var i = 0; i < el.childNodes.length; i++) {
          if (el.childNodes[i].className == "tempo") {
            updateBPM(el.childNodes[i].innerHTML);
          }
        }
      })
    });
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



/**
 * Get ALL sync extension data
 */
storage.get(function(data) {
  var renderContent = (params) => {
    var displayContainer = document.getElementById("display--detected")

    if (params.hasAudio) {
      var welcomeContainer = document.getElementById("display--welcome")
      welcomeContainer.style.display = "none";
      displayContainer.style.display = "block";
      buttonContainer.style.display = "block";
    }

    if (params.isAnalysing) {
      updateButtonStateTo("analyzing");
    }

    params.bpm = typeof(data.detectedVideos[params.youtubeId]) != 'undefined' ? data.detectedVideos[params.youtubeId] : '?';
    var tmpl = templateVideoDetected(params);
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
  onPlaySwitch.checked = data.onplay;
  onPlaySwitch.addEventListener('change', function (e) {
    var isChecked = this.checked;
    storage.set({ onplay: isChecked }, function () {
      console.log('done');
    });
  });
});