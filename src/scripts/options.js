import ext from "./utils/ext";
import storage from "./utils/storage";

var colorSelectors = document.querySelectorAll(".js-radio");
var checkboxOnPlay = document.querySelectorAll(".js-checkbox");

var setColor = (color) => {
  document.body.style.backgroundColor = color;
};

var setChecked = (bool) => {
  document.body.style.backgroundColor = color;
};

storage.get('color', function(resp) {
  var color = resp.color;
  var option;
  if(color) {
    option = document.querySelector(`.js-radio.${color}`);
    setColor(color);
  } else {
    option = colorSelectors[0]
  }

  option.setAttribute("checked", "checked");
});

colorSelectors.forEach(function(el) {
  el.addEventListener("click", function(e) {
    var value = this.value;
    storage.set({ color: value }, function() {
      setColor(value);
    });
  })
})

checkboxOnPlay.forEach(function(el) {
  // Init on dom
  storage.get('onplay', function (data) {
    if (typeof(data.onplay) == 'undefined') {
      // Default value
      console.log('Set default value');
      data.onplay = true;
    }
    console.log('Set value in dom');
    el.checked = data.onplay;
  });

  // Listen
  el.addEventListener("change", function (e) {
    var isChecked = this.checked;
    storage.set({ onplay: isChecked }, function () {
      console.log('yopupi');
    });
  })
})