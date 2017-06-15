'use strict';

// Get query params
var getQueryParams = (qs) => {
  qs = qs.split('+').join(' ');
  var params = {};
  var tokens;
  var re = /[?&]?([^=]+)=([^&]*)/g;
  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }
  return params;
}

module.exports = {
  getQueryParams: getQueryParams
}