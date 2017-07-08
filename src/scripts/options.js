import ext from "./utils/ext";
import storage from "./utils/storage";
import m from "mithril";

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function isCheckboxChecked (value) {
  return value ? 'checked' : '';
}
function isRadioChecked (value1, value2) {
  return value1 == value2 ? 'checked="checked"' : '';
}

var OptionComponent = {
  removeBPM: function (e) {
    e.preventDefault();
    var id = e.currentTarget.getAttribute('data-key');
    storage.removeDataStored(id);
    e.currentTarget.parentNode.parentNode.parentNode.remove();
  },
  oninit: function (vnode) {
    storage.get(function(data) {
      // Set DetectedVideo from extension
      vnode.state.detectedVideos = data.detectedVideos;
      // Init some value if necessary
      vnode.state.onplay = typeof(data.onplay) == 'undefined' ? true : data.onplay;
      vnode.state.minTime = typeof(data.minTime) == 'undefined' ? 13 : data.minTime;
      // onPlayToggle
      vnode.state.onPlayToggle = function (e) {
        vnode.state.onplay = ! vnode.state.onplay;
        storage.set({onplay: vnode.state.onplay}, function () {
          console.log('done');
        });
      }
      // onMinTimeChange
      vnode.state.onMinTimeChange = function (value) {
        vnode.state.minTime = value;
        storage.set({minTime: vnode.state.minTime}, function () {
          console.log('done');
        });
      }
      m.redraw();
    });
  },
  view: function (vnode) {
    return [
      m('div.grid', [
        m('div.unit.whole.center-on-mobiles', [
         m('div.heading', [
            m('h1', 'Allegro')
          ])
        ])
      ]),
      m('section.grid', [
        m('div.unit.whole', [
          m('h3', 'Paramètres'),
          m('div.option', [
            m('label', [
              m('input.js-checkbox-onplay.white[type="checkbox"]', {checked: isCheckboxChecked(vnode.state.onplay), onclick: vnode.state.onPlayToggle}),
              m('span', 'Analyse automatique')
            ]),
            m('p.text-muted', 'Analyse automatiquement toutes les pistes joués sur le navigateur'),
            m('div.option', [
              m('label', [
                m('span', 'Temps minimum du média '),
                m('span.text-muted', '(en minutes)')
              ]),
              m('div.radio-group.inline', [
                m('label', { for: "mintime-5"}, [
                  m('input#mintime-5.js-radio-mintime[type="radio"][name="mintime"][value="5"]', {checked: isRadioChecked(this.minTime, '5'), onclick: m.withAttr("value", this.onMinTimeChange)}),
                  m('span', '5')
                ]),
                m('label', { for: "mintime-8"}, [
                  m('input#mintime-8.js-radio-mintime[type="radio"][name="mintime"][value="8"]', {checked: isRadioChecked(this.minTime, '8'), onclick: m.withAttr("value", this.onMinTimeChange)}),
                  m('span', '8')
                ]),
                m('label', { for: "mintime-13"}, [
                  m('input#mintime-13.js-radio-mintime[type="radio"][name="mintime"][value="13"]', {checked: isRadioChecked(this.minTime, '13'), onclick: m.withAttr("value", this.onMinTimeChange)}),
                  m('span', '13')
                ]),
                m('label', { for: "mintime-21"}, [
                  m('input#mintime-21.js-radio-mintime[type="radio"][name="mintime"][value="21"]', {checked: isRadioChecked(this.minTime, '21'), onclick: m.withAttr("value", this.onMinTimeChange)}),
                  m('span', '21')
                ])
              ])
            ])
          ])
        ])
      ]),
      m('section.detected-bpms.grid', typeof(vnode.state.detectedVideos) != 'undefined' ? [
        m('h3', vnode.state.detectedVideos && Object.size(vnode.state.detectedVideos) + ' videos détectés'),
        function () {
          var vdom = [];
          vnode.state.detectedVideos && Object.keys(vnode.state.detectedVideos).forEach(function(key) {
            vdom.push(
              m('div.unit.one-third', [
                m('div.grid', [
                  m('div.unit.half', [
                    m('img[src="https://i.ytimg.com/vi/' + key + '/default.jpg"][width="117px"][height="88px"][alt="cover"]')
                  ]),
                  m('div.unit.half', [
                    m('a[target="_blank"]', {href: "https://youtube.com/watch?v=" + key}, 'Voir la vidéo'),
                    m('br'),
                    m('strong', 'BPM ' + vnode.state.detectedVideos[key]),
                    m('a.remove[href="#"]', {'data-key': key, onclick: vnode.state.removeBPM}, 'Effacer')
                  ])
                ])
              ])
            );
          });
          return vdom;
        }(),
      ] : m('h3', "Aucune vidéo analysé pour l'instant !")),
      m('br'),
      m('footer.main-footer', [
        m('div.grid', [
          m('div.unit.whole.center-on-mobiles', [
            m('p.text-center.text-muted', [
              m.trust('&copy; Allegro')
            ])
          ])
        ])
      ])
    ]
  }
}

// Mount component on DOM
m.mount(document.getElementById('root'), OptionComponent);