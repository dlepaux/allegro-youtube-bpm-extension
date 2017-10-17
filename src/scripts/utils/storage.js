import env from "./env";
import ext from "./ext";
import moment from './/moment';
import configApp from './../../../config/app.json';

var storageCustom = (ext.storage.sync ? ext.storage.sync : ext.storage.local);

/**
 * Shortcut for updating data of extension
 * @param  {Function} callback Function(data) which return data
 * @param  {Function} done     Function executed at the end of all operations
 */
storageCustom.updateData = (callback, done) => {
  storageCustom.get((data) => {
    const newData = callback(data);
    storageCustom.set(newData, done);
  });
};

/**
 * Resolve value for missing param for year, week, done
 * @param {Integer}   year Year number
 * @param {Integer}   week Week number
 * @param {Function}  done Callback
 * @param {Function}  fc   Modifier
 */
const YearWeekDoneResolver = function (year, week, done, fc) {
  if (typeof(week) == 'function') {
    done = week;
    week = year;
    year = moment().format("YYYY");
  } else if (typeof(year) == 'function') {
    done = year;
    year = moment().format("YYYY");
    week = moment.getCurrentWeekNumber();
  }
  return fc(year, week, done);
}

// YearWeek container
storageCustom.week = {};

/**
 * Add a yearWeek key in storage
 * @param {Integer}   year Full Year
 * @param {Integer}   week Week number
 * @param {Function}  done Callback
 */
storageCustom.week.add = function (year, week, done) {
  YearWeekDoneResolver(year, week, done, function (year, week, done) {
    const keyYearWeek = [year, week].join('-');

    storageCustom.get(function (data) {
      const addWeek = (allData) => {
        if (typeof(allData[keyYearWeek]) == 'undefined') {
          allData[keyYearWeek] = {};
        }
        return allData;
      };

      storageCustom.set(addWeek(data), () => done());
    });
  });
};

/**
 * Remove a yearWeek key in storage
 * @param  {Integer}   year Full Year
 * @param  {Integer}   week Week number
 * @param  {Function}  done Callback
 */
storageCustom.week.remove = function (year, week, done) {
  YearWeekDoneResolver(year, week, done, function (year, week, done) {
    const keyYearWeek = [year, week].join('-');

    storageCustom.get(function (data) {
      if (typeof(data[keyYearWeek]) !== 'undefined') {
        delete data[keyYearWeek];
        done();
      } else {
        done(new Error('Key ' + keyYearWeek + ' doesn\'t exist !'));
      }
    });
  });
};


/**
 * [YearWeekPairDoneResolver description]
 * @param {[type]}   year [description]
 * @param {[type]}   week [description]
 * @param {[type]}   pair [description]
 * @param {Function} done [description]
 * @param {[type]}   fc   [description]
 */
const YearWeekPairDoneResolver = function (year, week, pair, done, fc) {
  if (typeof(pair) == 'function') {
    done = pair;
    pair = week;
    week = year;
    year = moment.getCurrentYear();
  } else if (typeof(week) == 'function') {
    done = week;
    pair = year;
    week = moment.getCurrentWeekNumber();
    year = moment.getCurrentYear();
  } else if (typeof(year) == 'function') {
    throw new Error('You need to pass your pair data in first parameter !');
  }

  if (typeof(pair) != 'object') throw new Error('Variable "pair" need to be an object !');

  return fc(year, week, pair, done);
}

// Pair container
storageCustom.pair = {};


/**
 * [add description]
 * @param {[type]}   year [description]
 * @param {[type]}   week [description]
 * @param {[type]}   pair [description]
 * @param {Function} done [description]
 */
storageCustom.pair.add = function (year, week, key, value, done) {
  YearWeekPairDoneResolver(year, week, key, value, done, function (year, week, key, value, done) {

    const keyYearWeek = [year, week].join('-');
    const pair = {};
    pair[key] = value;

    storageCustom.get(function (data) {
      const addPair = (allData) => {
        allData[keyYearWeek] = Object.assign(allData[keyYearWeek], pair);
        return allData;
      };

      if (typeof(data[keyYearWeek]) == 'undefined') {
        storageCustom.week.add(year, week, function () {
          storageCustom.updateData((data) => {
            return addPair(data);
          }, done);
        });
      } else {
        storageCustom.set(addPair(data), () => done());
      }
    });
  });
};


/**
 * [remove description]
 * @param  {[type]}   year [description]
 * @param  {[type]}   week [description]
 * @param  {[type]}   key  [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
storageCustom.pair.remove = function (year, week, key, done) {
  YearWeekPairDoneResolver(year, week, key, done, function (year, week, key, done) {

    const keyYearWeek = [year, week].join('-');

    storageCustom.get(function (data) {
      if (typeof(data[keyYearWeek]) != 'undefined') {
        if (typeof(data[keyYearWeek][key]) != 'undefined') {
          delete data[keyYearWeek][key];
          storageCustom(data, () => {
            done();
          });
        } else {
          done(new Error('Error ! Key is not exists !'));
        }
      } else {
        done(new Error('Error ! Data is not initialized !'));
      }
    });

  });
};


/**
 * Init extension (config) and initThisDay
 * @param  {Function} done Callback
 */
storageCustom.initExtension = (done) => {
  storageCustom.updateData((data) => {
    if (typeof(data.config) == 'undefined') {
      /**
       * Set process.env to the right value
       */

      env();

      /**
       * Init global.allegro namespace for further usages
       */

      global.allegro = {};

      /**
       * Set initial configuration from template
       */

      data.config = configApp;
    }
    return data;
  }, done);
};

/**
 * Extract data from storage (to more readable object)
 * @param  {Function} done Callback
 */
storageCustom.getDetectedVideos = function (done) {
  storageCustom.get(function (data) {
    const dataReOrganized = {detectedVideos: {}};
    Object.keys(data).forEach(function(key) {
      if (key.indexOf('-') != -1) {
        // year-week data
        const dataYearWeek = key.split('-');
        if (typeof(dataReOrganized.detectedVideos[dataYearWeek[0]]) == 'undefined') {
          dataReOrganized.detectedVideos[dataYearWeek[0]] = {};
        }
        dataReOrganized.detectedVideos[dataYearWeek[0]][dataYearWeek[1]] = data[key];
      } else {
        // regular data
        dataReOrganized[key] = data[key];
      }
    });
    done(dataReOrganized);
  });
};

/**
 * Insert data to storage
 * @param {Object}   data getDetectedVideos
 * @param {Function} done Callback
 */
storageCustom.setDetectedVideos = function (data, done) {
  let storedData = {};
  if (typeof(data.detectedVideos) != 'undefined') {
    Object.keys(data.detectedVideos).forEach(function(year) {
      Object.keys(data.detectedVideos[year]).forEach(function(week) {
        let keyYearWeek = year + '-' + week;
        storedData[keyYearWeek] = data.detectedVideos[year][week];
      });
    });
  };
  done(storedData);
};


// Export
module.exports = (override = {}) => Object.assign(storageCustom, override);