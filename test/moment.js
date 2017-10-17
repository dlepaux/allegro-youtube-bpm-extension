// Require Chai.expect
const expect = require('chai').expect;

// Require moment extended
const moment = require('./../src/scripts/utils/moment');

module.exports = () => {
  // Test Moment shortcuts
  describe('Shortcuts', () => {
    it('Should return the current week number', () => {
      expect(moment.getCurrentWeekNumber()).to.be.equal(moment().format('W'));
    });

    it('Should return the current year', () => {
      expect(moment.getCurrentYear()).to.be.equal(moment().format('YYYY'));
    });
  });

  // Test Moment utils
  describe('Utils', () => {
    it('Should fill', () => {
      expect(moment.zeroFill('1')).to.be.equal('01');
      expect(moment.zeroFill(1)).to.be.equal('01');
      expect(moment.zeroFill('')).to.be.equal('');
    });

    it('Should not fill', () => {
      expect(moment.zeroFill('21')).to.be.equal('21');
    });
  });
};