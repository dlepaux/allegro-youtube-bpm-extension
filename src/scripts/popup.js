import ext from "./utils/ext";
import storage from "./utils/storage";

// Get Data
storage.get('color', function(resp) {
  var color = resp.color;
  if(color) {
    popup.style.backgroundColor = color
  }
});

var template = (data) => {
  var json = JSON.stringify(data);
  return (`
  <div class="site-description">
    <h3 class="title">${data.title}</h3>
    <p class="description">${data.description}</p>
    <a href="${data.url}" target="_blank" class="url">${data.url}</a>
  </div>
  `);
}
var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
}

var renderBookmark = (data) => {
  var displayContainer = document.getElementById("display-container")
  if(data) {
    var tmpl = template(data);
    displayContainer.innerHTML = tmpl;
  } else {
    renderMessage("Sorry, could not extract this page's title and URL")
  }
}

ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderBookmark);
});

// Set listener to footer button
var optionsLink = document.querySelectorAll(".js-options");
optionsLink.forEach(function(el) {
  el.addEventListener("click", function(e) {
    e.preventDefault();
    ext.tabs.create({'url': ext.extension.getURL('options.html') + el.getAttribute('href')});
  })
})
