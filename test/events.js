// Require Chai.expect
const expect = require('chai').expect;
const chrome = require('sinon-chrome');
global.chrome = chrome;
require('./../src/scripts/background');

module.exports = () => {

  // Test Moment shortcuts
  describe('Events', () => {

    beforeEach(function () {
      chrome.runtime.sendMessage.flush();
    });

    it('should subscribe on chrome.runtime.onMessage', function () {
      expect(chrome.runtime.onMessage.addListener.calledOnce).to.be.true;
    });

    /*it('should send correct action on runtime message event', function () {
      expect(chrome.notifications.create.notCalled).to.be.true;
      chrome.runtime.onMessage.dispatch({action: 'start'});
      expect(chrome.notifications.create.calledOnce).to.be.true;
      expect(chrome.notifications.create.withArgs('start').calledOnce).to.be.true;
    });

    it('should send unknow action on runtime message event', function (done) {
      chrome.runtime.onMessage.dispatch({action: 'unknow-action'}, null, (err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });*/

    after(function () {
      chrome.flush();
      delete global.chrome;
    });
  });
};
