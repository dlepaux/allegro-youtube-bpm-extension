import ext from "./utils/ext";
import Storage from "./utils/storage";
const storage = Storage();
import allegro from "./allegro/allegro";
import m from "mithril";


function isCheckboxChecked (value) {
  return value ? 'checked' : '';
}

var state = {
  status: "call-to-analyze",
  modalOpen: false,
}



var PopupComponent = {
  // Modal
  openModalDialog: function (e = null) {
    e && e.preventDefault();
    state.modalOpen = true;
    m.redraw();
  },
  closeModalDialog: function (e = null) {
    e && e.preventDefault();
    state.modalOpen = false;
    m.redraw();
  },

  // Links
  openLink: function(e) {
    e.preventDefault();
    ext.tabs.create({'url': ext.extension.getURL('options.html') + e.currentTarget.getAttribute('href')});
  },

  onCTA: function (e) {
    // State Analyzed
    if (state.status == "analyzed") {
      PopupComponent.openModalDialog(e);
    }
    // State call to analyse
    if (state.status == "call-to-analyze") {
      ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'analyse-bpm' }, function (data) {
          state.status = "analyzing";
        });
      });
    }
    // State Analyzing
    if (state.status == "analyzing") {
      ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'kill-analyze' }, function (data) {
          state.status = "call-to-analyze";
        });
      });
    }
  },

  // Init data
  oninit: function (vnode) {
    // Listenner onMessage Event (sent from contentscript.js), add selection of the good tab / window
    ext.runtime.onMessage.addListener( function (request, sender, sendResponse) {
      if (request.action === 'progression') {
        vnode.state.progression = request.progression;
        m.redraw();
      }
      if (request.action === 'audio-analyzed') vnode.state.showAnalyzedData(request);
    });

    // Get ALL sync data extension
    storage.get(function(data) {
      // Select active tab to get meta data
      ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, (params) => {
          // Sync page data and vnode.state
          Object.assign(vnode.state, params);
          // Check state
          if (vnode.state.isAnalysing) state.status = "analyzing";
          // hasAlready a BPM
          vnode.state.bpm = typeof(data.detectedVideos[vnode.state.youtubeId]) != 'undefined' ? data.detectedVideos[vnode.state.youtubeId] : '?';
          // Onplay Dynamic option
          vnode.state.onplay = data.onplay || false;
          vnode.state.onChangeOnplay = function (e) {
            var isChecked = this.checked;
            vnode.state.onplay = isChecked;
            storage.set({ onplay: isChecked }, function () {
              console.log('done');
            });
          }
          // Show analyzed data
          vnode.state.showAnalyzedData = function (request) {
            state.status = "analyzed";
            vnode.state.bpm = request.bpm;
            vnode.state.bpmCandidates = request.bpmCandidates;
            m.redraw();
          }

          vnode.state.activeCandidate = function (tempo) {
            if (vnode.state.bpm == tempo) {
              return 'active';
            }
            return '';
          }

          // Redraw
          m.redraw();
        });
      });
    });
  },

  view: function (vnode) {
    return [
      m('header', [
        m('img.popup--icon', {src: "icons/icon-38.png"}),
        m('div.switch--container.float.right', [
          m('input#onplay.switch[type="checkbox"]', {style: "float:right;", checked: isCheckboxChecked(this.onplay), onclick: this.onChangeOnplay}),
          m('label', {style: "float:right;", for: "onplay"}),
          m('span.label', {style:"float:right;"}, 'Auto detect')
        ]),
        m('div.clearfix')
      ]),
      m('div.popup--content', [
        this.hasAudio ? [
          m('div.display--head grid', [
            m('div.unit.half.video--detected', 'Vidéo détecté'),
            m('div.unit.half.align-right.video--origin.text-grey-green', this.origin)
          ]),
          m('div.display--body.grid.no-float', [
            m('div.unit half', [
              m('img[width="117px"][height="88px"][alt="cover"]', {src: "https://i.ytimg.com/vi/" + this.youtubeId + "/default.jpg"})
            ]),
            m('div.unit.half.video--details', [
              m('h3', this.title),
              m('p', this.duration),
              m('p', [
                m('strong', 'BPM '),
                m('span', this.bpm)
              ])
            ])
          ]),
          m('div.popup--cta.text-center', {class: 'state-' + state.status, onclick: this.onCTA}, [
            m('a.btn', [
              m('span.call-to-analyze', 'ANALYSER BPM'),
              m('span.analyzing', [
                m('span', 'ANALYSE...'),
                m('br'),
                m('span#progression-text', this.progression + ' %'),
                m('span.progression-bar#progression-bar', {style: 'width:' + this.progression + ' %'})
              ]),
              m('span.analyzed#analyzed', [
                m('span', 'RÉSULTAT'),
                m('br'),
                m('span.bpm', this.bpm)
              ])
            ])
          ])
        ] : m('p.popup--welcome-text.text-center.text-light-blue', [
          m('span', 'Bienvenue sur Allegro,'),
          m('br'),
          m('br'),
          m('span', 'Profitez des fonctionnalités en jouant'),
          m('br'),
          m('span', 'une vidéo sur '),
          m('a.text-light-blue[href="https://www.youtube.com"][target="_blank"]', 'Youtube !')
        ])
      ]),
      m('footer', [
        m('ul', [
          m('li', [
            m('a.js-options', {href: "#list", onclick: this.openLink}, [
              m('img[src="images/icon-list.png"][alt="icon-list"]'),
              m('span', 'Liste des BPM detecté')
            ]),
          ]),
          m('li', [
            m('a.js-options', {href: "#options", onclick: this.openLink}, [
              m('img[src="images/icon-cog.png"][alt="icon-cog"]'),
              m('span', 'Paramètres')
            ])
          ])
        ])
      ]),
      m('div.modal.bpm-candidates', {style: 'display: ' + (state.modalOpen ? 'block' : 'none')}, [
        m('div.close', {onclick: this.closeModalDialog}, '×'),
        m('h4', 'BPM Potentiel'),
        m('p', 'Modifiez le BPM en choisissant un autre candidat !'),
        m('div#bpm-candidates', m('ul', vnode.state.bpmCandidates && vnode.state.bpmCandidates.map(function (candidate, index) {
          return m('li', {class: vnode.state.activeCandidate(candidate.tempo), onclick: () => {
            vnode.state.bpm = candidate.tempo;
          }}, [
            m('span.head', index + 1),
            m('span.count', candidate.count + 'x'),
            m('span.tempo', candidate.tempo)
          ])
        }))),
        m('p.text-center', [
          m('a.btn.btn-default#submit-bpm-update', {onclick: this.closeModalDialog}, 'Valider changement')
        ])
      ])
    ];
  }
}

// Mount component on DOM
m.mount(document.getElementById('root'), PopupComponent);