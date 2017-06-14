"use strict";

// 02bf51 vert clair
// 383eb5 violet 

var main_color = '#398649';
var youtube_red = '#e52d27';

var public_path = 'chrome-extension://bncgbealpndkkkfhfjjekolhpkggpfjf';

module.exports = {
  css: {
    "@keyframes :global(aroundtheworld)": {
      " from": {transform: "rotate(0deg)"},
      " to ": {transform: "rotate(360deg)"},
    },
    
    "@keyframes :global(live)": {
      " from": {opacity:1},
      " to ": {opacity:0},
    },
    
    '@font-face': {
      fontFamily: '"fontastic"',
      src: ['url("' + public_path + '/fonts/fontastic.eot")',
        'url("' + public_path + '/fonts/fontastic.eot?#iefix") format("embedded-opentype"),\n    url("' + public_path + '/fonts/fontastic.woff") format("woff"),\n    url("' + public_path + '/fonts/fontastic.ttf") format("truetype"),\n    url("' + public_path + '/fonts/fontastic.svg#fontastic") format("svg")'
      ],
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    '[class^="icon-"]:before, [class*=" icon-"]:before': {
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
    },
    '.icon-circle:before': {
      content: '"\\61"'
    },
    '.icon-bug:before': {
      content: '"\\63"'
    },
    '.icon-briefcase:before': {
      content: '"\\62"'
    },
    '.icon-cloud:before': {
      content: '"\\64"'
    },
    '.icon-ios-speedometer:before': {
      content: '"\\66"'
    },
    '.icon-speedometer:before': {
      content: '"\\67"'
    },
    '.icon-ios-speedometer-outline:before': {
      content: '"\\65"'
    },


    "span, a, p": {
      "&.primary-color": {
        color: main_color
      }
    },
    ".mithril-root": {
      float: 'left'
    },

    
    ".bars": {
      'margin-top':'5px',
      display: 'inline-block',
      width: '32px',
      position:'relative'
    },
    ".bar": {
      float: 'left',
      height: '25px',
      width: '2px',
      position:'relative'
    },
    ".bar_inner": {
      ///* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#02bf51+0,383eb5+100 */
      position:'absolute',
      bottom:0,
      left:0;,
      width: '2px',
      background: "rgb(2,191,81)",
      background: "-moz-linear-gradient(top, rgba(2,191,81,1) 0%, rgba(56,62,181,1) 100%)",
      background: "-webkit-linear-gradient(top, rgba(2,191,81,1) 0%,rgba(56,62,181,1) 100%)",
      background: "linear-gradient(to bottom, rgba(2,191,81,1) 0%,rgba(56,62,181,1) 100%)",
      filter: "progid:DXImageTransform.Microsoft.gradient( startColorstr='#02bf51', endColorstr='#383eb5',GradientType=0 )"
    }



    // Text Helpers
    ".inline-block": {
      "display": "inline-block"
    },
    ".text-expose": {
      "font-size": "50%",
      position: "relative",
      "vertical-align": "top !important",
      "line-height": "1",
      display: "inline-block"
    },
    // Main container
    ".line-height32": {
      "line-height": "32px",
      "height": "32px",
      '.icon-ios-speedometer, .icon-speedometer, .icon-ios-speedometer-outline': {
        'display': 'inline-block',
        'height': '20px',
        'line-height': '20px'
      }
    },


    // Container main
    ".container": {
      position: "absolute",
      display: "table",
      "font-size": "15px",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      "z-index": 1
      "&, & *": {
        "-webkit-box-sizing": "border-box",
        "-moz-box-sizing": "border-box",
        "box-sizing": "border-box"
      }
    },

    ".container_row": {
      display: "table-row",
      height: "100%",
      width: "100%",
      position: "relative",
    },
    ".container_cell": {
      height: "100%",
      width: "100%",
      position: "relative",
      display: "table-cell",
      "vertical-align": "middle",
      "text-align": "center"
    },
    ".container_inner": {
      position: 'relative',
      display: 'inline-block'
    },
    ".icon_main": {
      width: "100px",
      height: "100px",
      position: "relative",
      display: "block",
      "&:hover": {
        "&:after, &:before, &> img": {
          transform: "scale(.95)",
          "-webkit-transition": "-webkit-all .2s ease-in-out",
          "-moz-transition": "-moz-all .2s ease-in-out",
          transition: "all .2s ease-in-out"
        }
      },
      "&:after, &:before": {
        content: '""',
        position: "absolute",
        top: "-1px",
        bottom: "0",
        left: "-1px",
        right: "0",
        width: "102px",
        height: "102px",
        "border-radius": "50%",
        "pointer-events": "none"
      },
      "&:before": {
        "z-index": 50,
        "box-shadow": "inset 0 -10px 20px black, inset 0 0px 20px 20px rgba(0,0,0,.5)"
      },
      "&:after": {
        "z-index": 40,
        background: main_color
      },

      "&:after, &:before, &> img": {
        transform: "scale(1)",
        "-webkit-transition": "-webkit-all .2s ease-in-out",
        "-moz-transition": "-moz-all .2s ease-in-out",
        transition: "all .2s ease-in-out"
      },

      "&> img": {
        position: "absolute",
        "display":"block",
        "z-index": 70
      }
    },
    // Rads
    ".rads": {
      width: "100px",
      height: "100px",
      position: "absolute",
      display: "block",
      "z-index": 20,
      animation: ":global(aroundtheworld) 10s infinite linear",
      'transform-origin': 'center center',
      "&> .rad": {
        position: "absolute",
        top:0,
        left:0,
        right:0,
        bottom:0,
        "> div": {
          position: "absolute",
          top:'50px',
          left:'50px',
          "width":"100%",
          "height":"3px",
          background: '-webkit-linear-gradient(left, rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%)',
          background: 'linear-gradient(to right, rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%)'
        }
      }
    },
    // Bullet
    ".bullet": {
      display: 'inline-block',
      "height": "10px",
      "margin-right": "4px",
      "width": "10px",
      opacity: 1,
      animation: ":global(live) 2s infinite ease",
      "&:before": {
        content: '""',
        display: 'inline-block',
        "height": "10px",
        "width": "10px",
        "border-radius": '50%',
        background: '#e62117'
      }
    }
  }
}