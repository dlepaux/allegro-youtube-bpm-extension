import moment from 'moment';

/**
 * Moment configuration
 */

moment.updateLocale('en', {
  week : {
    dow : 1 // Monday is the first day of the week
  }
});


/**
 * Get current week number
 * @return {Integer} Week number (1/51)
 */

moment.getCurrentWeekNumber = function () {
  return moment().format('W');
};



/**
 * Get current week number
 * @return {Integer} Week number (1/51)
 */

moment.getCurrentYear = function () {
  return moment().format("YYYY");
};


/**
 * Fill a zero at start if length equal one
 * @param  {Integer|String} value Hour, minute, second, ...
 * @return {String}               Filled value
 */

moment.zeroFill = function (value) {
  if (value.toString().length == 1) value = '0' + value;
  return value;
};

module.exports = moment