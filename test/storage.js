// Require Chai.expect
const expect = require('chai').expect;

// Require moment extended
let store = {};
let storage = require('./../src/scripts/utils/storage');

const moment = require('./../src/scripts/utils/moment');
const configApp = require('./../config/app.json');

// Advanced storage stub
storage = storage({
  get: (key, callback) => {
    if (typeof(key) === 'function') {
      callback = key;
      callback(store)
    } else {
      callback(typeof(store[key]) !== 'undefined' ? store[key] : null);
    }
  },
  set: (data, callback) => {
    store = Object.assign(store, data);
    callback && callback();
  },
  clear: function (done) {
    store = {};
    done && done();
  }
});

module.exports = () => {
  // Test Storage
  describe('Chrome API get/set', () => {
    it('should returns null', function () {
      storage.get('test', function (data) {
        expect(data).to.be.equal(null);
      });
    });
    it('should returns "world"', function () {
      storage.set({'hello': 'world'}, () => {
        storage.get('hello', function (data) {
          expect(data).to.be.equal('world');
        });
      });
    });
    it('should return all stored data', function () {
      storage.set({'world': 'hello'}, () => {
        storage.get(function (data) {
          expect(data.world).to.be.equal('hello');
          expect(data.hello).to.be.equal('world');
        });
      });
    });

    after(function () {
      storage.clear();
    });
  });

  describe('Extended Storage updater', () => {
    it('should update Data', function (done) {
      storage.updateData((data) => {
        data.helloworld = {};
        return data;
      }, function () {
        storage.get(function (data) {
          expect(JSON.stringify(data.helloworld)).to.be.equal(JSON.stringify({}));
          done()
        });
      });
    });

    after(function () {
      storage.clear();
    });
  });


  describe('Extended Storage', () => {

    const date = moment();
    const currentYear = parseInt(date.format("YYYY"));
    const currentWeekNumber = parseInt(moment.getCurrentWeekNumber());
    const currentYearWeek = [currentYear, currentWeekNumber].join('-');

    beforeEach(function () {
      storage.set({config: configApp});
    });

    afterEach(function () {
      storage.clear();
    });

    describe('Week', () => {

      it('should add week number entry point with callback only', function (done) {
        storage.week.add(() => {
          storage.get(function (data) {
            expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
            done();
          });
        });
      });

      it('should add week number entry point with callback only', function (done) {
        storage.week.add(currentWeekNumber, () => {
          storage.get(function (data) {
            expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
            done();
          });
        });
      });


      it('should add week number entry point with callback only', function (done) {
        storage.week.add(currentYear, currentWeekNumber, () => {
          storage.get(function (data) {
            expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
            done();
          });
        });
      });

      it('should add week on existing year', function (done) {
        const extendedStore = {};
        extendedStore[currentYearWeek] = {};

        storage.set(extendedStore, () => {
          storage.get(function (data) {
            const currentWeekData = {};
            currentWeekData.config = configApp;
            currentWeekData[currentYearWeek] = {};
            expect(JSON.stringify(data)).to.be.equal(JSON.stringify(currentWeekData));
            storage.week.add(currentWeekNumber, () => {
              storage.get(function (data) {
                expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
                expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
                done();
              });
            });
          });
        });
      });

      it('should remove specific year, week entry point', function (done) {
        storage.week.add(() => {
          storage.get(function (data) {
            expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
            storage.week.remove(currentYear, currentWeekNumber, () => {
              storage.get(function (data) {
                expect(JSON.stringify(data[currentYearWeek])).to.be.undefined;
                done();
              });
            });
          });
        });
      });

      it('should remove current year with specific week entry point', function (done) {
        storage.week.add(() => {
          storage.get(function (data) {
            expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
            storage.week.remove(currentWeekNumber, () => {
              storage.get(function (data) {
                expect(JSON.stringify(data[currentYearWeek])).to.be.undefined;
                done();
              });
            });
          });
        });
      });

      it('should remove current year, week entry point', function (done) {
        storage.week.add(() => {
          storage.get(function (data) {
            expect(JSON.stringify(data[currentYearWeek])).to.be.equal(JSON.stringify({}));
            storage.week.remove(() => {
              storage.get(function (data) {
                expect(JSON.stringify(data[currentYearWeek])).to.be.undefined;
                done();
              });
            });
          });
        });
      });

      it('should throw Error remove unexisted week data', function (done) {
        storage.week.remove((err) => {
          expect(err).to.be.instanceOf(Error);
          done();
        });
      });
    });

    describe('Other', () => {

      it('should init the extension (no config setted)', function (done) {
        storage.clear();
        storage.initExtension(() => {
          storage.get(function (data) {
            expect(typeof(data.config)).to.be.not.null;
            expect(JSON.stringify(global.allegro)).to.be.not.null;
            done();
          });
        });
      });

      it('should init the extension (config already setted)', function (done) {
        storage.initExtension(() => {
          storage.get(function (data) {
            expect(typeof(data.config)).to.be.not.null;
            expect(JSON.stringify(global.allegro)).to.be.not.null;
            done();
          });
        });
      });

      it('should retrieve stored data with getDetectedVideos', function (done) {
        storage.initExtension(() => {
          storage.pair.add({foo: 'bar'}, () => {
            storage.getDetectedVideos(function (data) {
              expect(data.detectedVideos).to.be.not.null;
              done();
            });
          });
        });
      });

      it('should test getDetectedVideos/edits/setDetectedVideos', function (done) {
        storage.initExtension(() => {
          storage.pair.add({bar: 'foo'}, () => {
            storage.getDetectedVideos(function (data) {
              const now = new Date();
              expect(data.detectedVideos).to.be.not.null;
              // Add fake interval data
              data.detectedVideos[now.getFullYear() + '-1'] = {
                foo: 'bar'
              };
              // Store data
              storage.setDetectedVideos(data, function (newData) {
                expect(newData[now.getFullYear() + '-1']).to.be.not.null;
                done();
              });
            });
          });
        });
      });
    });
  });
};
