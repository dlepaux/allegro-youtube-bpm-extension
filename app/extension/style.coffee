"use strict";






main_color = '#398649'
youtube_red = '#e52d27'

public_path = 'chrome-extension://__MSG_@@extension_id__'

module.exports = 
  css: {
    "@keyframes :global(aroundtheworld)":
      " from": {transform: "rotate(0deg)"}
      " to ": {transform: "rotate(360deg)"}
    
    "@keyframes :global(live)":
      " from": {opacity:1}
      " to ": {opacity:0}
    
    '@font-face':
      fontFamily: '"fontastic"',
      src: ['url("' + public_path + '/fonts/fontastic.eot")',
        'url("' + public_path + '/fonts/fontastic.eot?#iefix") format("embedded-opentype"),\n    url("' + public_path + '/fonts/fontastic.woff") format("woff"),\n    url("' + public_path + '/fonts/fontastic.ttf") format("truetype"),\n    url("' + public_path + '/fonts/fontastic.svg#fontastic") format("svg")'
      ],
      fontWeight: 'normal',
      fontStyle: 'normal'
    '[class^="icon-"]:before, [class*=" icon-"]:before':
      fontFamily: '"fontastic" !important',
      fontStyle: 'normal !important',
      fontWeight: 'normal !important',
      fontVariant: 'normal !important',
      textTransform: 'none !important',
      speak: 'none',
      lineHeight: 1,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      verticalAlign: 'middle'
    '.icon-circle:before':
      content: '"\\61"'
    '.icon-bug:before':
      content: '"\\63"'
    '.icon-briefcase:before':
      content: '"\\62"'
    '.icon-cloud:before':
      content: '"\\64"'
    '.icon-ios-speedometer:before':
      content: '"\\66"'
    '.icon-speedometer:before':
      content: '"\\67"'
    '.icon-ios-speedometer-outline:before':
      content: '"\\65"'


    "span, a, p":
      "&.primary-color":
        color: main_color

    ".mithril-root":
      float: 'left'

    ".tgl":
      display: "none"
      # add default box-sizing for this scope
      "&, &:after, &:before, & *, & *:after, & *:before, & + .tgl-btn":
        "box-sizing": "border-box"
        "&::selection":
          background: "none"
      
      "+ .tgl-btn":
        outline: 0
        display: "block"
        width: "3em"
        height: "1em"
        position: "relative"
        cursor: "pointer"
        "user-select": "none"
        "&:after, &:before":
          position: "relative"
          display: "block"
          content: '""'
          width: '21px'
          height: '21px'
    
        "&:after":
          left: 0
        
        "&:before":
          display: 'none'
      
      "&:checked + .tgl-btn:after":
        left: '50%'
        'margin-left': '-2px'

    # Toggle Switch IOS
    ".tgl-ios + .tgl-btn":
        "top": "12px"
        background: "#fbfbfb"
        'border-radius': "2em"
        padding: "0px"
        transition: "all .4s ease"
        #border: "1px solid #e8eae9"
        "&:after":
          'top': '-5px'
          'border-radius': "2em"
          background: "#fbfbfb"
          transition: "left .3s cubic-bezier(0.175, 0.885, 0.320, 1.275), padding .3s ease, margin .3s ease"
          'box-shadow': "0 0 0 1px rgba(0,0,0,.1), 0 4px 0 rgba(0,0,0,.08)"
        "&:hover:after":
          "will-change": "padding"
        "&:active":
          "box-shadow":" inset 0 0 0 2em #e8eae9"
          "&:after":
            "padding-right": "1em"
      "&:checked + .tgl-btn":
        background: youtube_red
        "&:active":
          "box-shadow": 'none'
          "&:after":
            "margin-left": '-1em'




    # Text Helpers
    ".inline-block":
      "display": "inline-block"
    ".text-expose":
      "font-size": "50%"
      position: "relative"
      "vertical-align": "top !important"
      "line-height": "1"
      display: "inline-block"

    # Main container
    ".line-height32":
      "line-height": "32px"
      "height": "32px"
      '.icon-ios-speedometer, .icon-speedometer, .icon-ios-speedometer-outline':
        'display': 'inline-block'
        'height': '20px'
        'line-height': '20px'


    # Container main
    ".container":
      position: "absolute"
      display: "table"
      "font-size": "15px"
      top: 0
      right: 0
      bottom: 0
      left: 0
      "z-index": 1
      "&, & *":
        "-webkit-box-sizing": "border-box"
        "-moz-box-sizing": "border-box"
        "box-sizing": "border-box"

    ".container_row":
      display: "table-row"
      height: "100%"
      width: "100%"
      position: "relative"
    ".container_cell":
      height: "100%"
      width: "100%"
      position: "relative"
      display: "table-cell"
      "vertical-align": "middle"
      "text-align": "center"

    ".container_inner": 
      position: 'relative'
      display: 'inline-block'

    ".icon_main":
      width: "100px"
      height: "100px"
      position: "relative"
      display: "block"

      "&:hover":
        "&:after, &:before, &> img":
          transform: "scale(.95)"
          "-webkit-transition": "-webkit-all .2s ease-in-out"
          "-moz-transition": "-moz-all .2s ease-in-out"
          transition: "all .2s ease-in-out"

      "&:after, &:before":
        content: '""'
        position: "absolute"
        top: "-1px"
        bottom: "0"
        left: "-1px"
        right: "0"
        width: "102px"
        height: "102px"
        "border-radius": "50%"
        "pointer-events": "none"
      "&:before":
        "z-index": 50
        "box-shadow": "inset 0 -10px 20px black, inset 0 0px 20px 20px rgba(0,0,0,.5)"
      "&:after":
        "z-index": 40
        background: main_color

      "&:after, &:before, &> img":
        transform: "scale(1)"
        "-webkit-transition": "-webkit-all .2s ease-in-out"
        "-moz-transition": "-moz-all .2s ease-in-out"
        transition: "all .2s ease-in-out"

      "&> img":
        position: "absolute"
        "display":"block"
        "z-index": 70
    
    # Rads
    ".rads":
      width: "100px"
      height: "100px"
      position: "absolute"
      display: "block"
      "z-index": 20
      animation: ":global(aroundtheworld) 10s infinite linear"
      'transform-origin': 'center center'

      "&> .rad":
        position: "absolute"
        top:0
        left:0
        right:0
        bottom:0
        "> div":
          position: "absolute"
          top:'50px'
          left:'50px'
          "width":"100%"
          "height":"3px"
          background: '-webkit-linear-gradient(left, rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%)'
          background: 'linear-gradient(to right, rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%)'


    # Bullet
    ".bullet":
      display: 'inline-block'
      "height": "10px"
      "margin-right": "4px"
      "width": "10px"
      opacity: 1
      animation: ":global(live) 2s infinite ease"
      "&:before":
        content: '""'
        display: 'inline-block'
        "height": "10px"
        "width": "10px"
        "border-radius": '50%'
        background: '#e62117'
  }