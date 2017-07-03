import ext from "./utils/ext";
import storage from "./utils/storage";
import allegro from "./allegro/allegro";
//allegro.getAudioElement();

var template = (data) => {
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
        <p class="text-grey-green">${data.duration}</p>
      </div>
    </div>
  `);
}
var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
}
function changeState (newState) {
  buttonContainer.classList.remove('state-' + state);
  buttonContainer.classList.add('state-' + newState);
  state = newState;
}
var buttonContainer = document.getElementById("display--buttons")
var renderContent = (data) => {
  var displayContainer = document.getElementById("display--detected")

  if (data.hasAudio) {
    var welcomeContainer = document.getElementById("display--welcome")
    welcomeContainer.style.display = "none";
    displayContainer.style.display = "block";
    buttonContainer.style.display = "block";
  }

  if (data.isAnalysing) {
    changeState("analyzing");
  }

  if(data) {
    var tmpl = template(data);
    displayContainer.innerHTML = tmpl;
  } else {
    renderMessage("Sorry, could not extract this page's title and URL")
  }
}


// Set listener on Call To Action
var btnAnalyse = document.getElementById('call-to-action-btns');
var state = "call-to-analyze";

btnAnalyse && btnAnalyse.addEventListener('click', function (e) {
  // State : Call to analyze
  if (state == "call-to-analyze") {
    ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'analyse-bpm' }, function (data) {
        changeState("analyzing");
      });
    });
  }

  // State Analyzing
  if (state == "analyzing") {
    ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'kill-analyze' }, function (data) {
        changeState("call-to-analyze");
      });
    });
  }
});


// Set listener to footer button
var optionsLink = document.querySelectorAll(".js-options");
optionsLink.forEach(function(el) {
  el.addEventListener("click", function(e) {
    e.preventDefault();
    ext.tabs.create({'url': ext.extension.getURL('options.html') + el.getAttribute('href')});
  })
})

// Update progression
var progression = document.getElementById('progression');
var progressionBar = document.getElementById('progression-bar');
function updateProgression (percent) {
  progression.innerHTML = percent + ' %';
  progressionBar.style.width = percent + '%';
}

// Update to show result
function updateStateToAnalyzed (bpm) {
  changeState("analyzed");
  var bpmInner = document.getElementById('bpm');
  bpmInner.innerHTML = bpm + 'BPM';
}

// Liste"n message sent from page
function onRequest(request, sender, sendResponse) {
  if (request.action === 'progression') {
    updateProgression(request.progression);
  }
  if (request.action === 'audio-analyzed') {
    updateStateToAnalyzed(request.bpm);
  }
}
ext.runtime.onMessage.addListener(onRequest);



ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  console.log(activeTab)
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderContent);
});