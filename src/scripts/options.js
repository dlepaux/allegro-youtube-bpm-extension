import ext from "./utils/ext";
import storage from "./utils/storage";

// Extend Object
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Get ALL sync extension data
 */
storage.getDataStored(function(data) {
  var container = document.querySelector('.detected-bpms');
  var list = (`<h3>${Object.size(data)} videos détectés</h3><br>`);
  for(var o in data) {
    list += (`
      <div class="unit one-third">
        <div class="grid">
          <div class="unit half">
            <img src="https://i.ytimg.com/vi/${o}/default.jpg" width="117px" height="88px" alt="cover"/>
          </div>
          <div class="unit half">
            <a target="_blank" href="https://youtube.com/watch?v=${o}">Voir la vidéo</a><br>
            <strong>BPM ${data[o]}</strong>
            <a href="#" class="remove" data-key="${o}">Effacer</a>
          </div>
        </div>
      </div>
    `);
  }
  container.innerHTML = list;

  function removeBPM (e) {
    e.preventDefault();
    var id = e.currentTarget.getAttribute('data-key');
    storage.removeDataStored(id);
    e.currentTarget.parentNode.parentNode.parentNode.remove();
  }

  var wait = setTimeout( function () {
    var removeLinks = document.querySelectorAll('.detected-bpms a.remove');
    removeLinks.forEach( function (el) {
      el.addEventListener('click', removeBPM);
    });
  }, 120);
});





















var minTimeSelectors = document.querySelectorAll(".js-radio-mintime");
var checkboxOnPlay = document.querySelector(".js-checkbox-onplay");

// On INITIALIZATION
/*
var hash = window.location.hash.substr(1);
if (hash.length == 0) {

}*/











////////////
//  ONPLAY
////////////
// Set actual value of onplay option
// Init on dom
storage.get('onplay', function (data) {
  if (typeof(data.onplay) == 'undefined') {
    // Default value
    console.log('Set default value to onplay');
    data.onplay = true;
  }
  console.log('Set value in dom');
  checkboxOnPlay.checked = data.onplay;
});
// Listen onplay change
checkboxOnPlay.addEventListener("change", function (e) {
  var isChecked = this.checked;
  storage.set({ onplay: isChecked }, function () {
    console.log('done');
  });
});


////////////
//  MINIMUM TIME
////////////
// Set actual value of minTime
storage.get('minTime', function(data) {
  if (typeof(data.minTime) == 'undefined') {
    // Default value
    console.log('Set default value to minTime');
    data.minTime = 13;
  }
  console.log('Set value in dom');
  var minTimeEl = document.getElementById('mintime-' + data.minTime);
  if (minTimeEl) {
    minTimeEl.checked = true;
  }
});
// Listen minTime change
minTimeSelectors.forEach(function(el) {
  el.addEventListener("click", function(e) {
    var value = this.value;
    storage.set({ mintime: value }, function() {
      console.log('done');
    });
  })
})