import ext from "./utils/ext";
import storage from "./utils/storage";

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