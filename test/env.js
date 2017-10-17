// Require Chai.expect
const expect = require('chai').expect;

// Require moment extended
const env = require('./../src/scripts/utils/env');

module.exports = () => {
  // Test Moment shortcuts
  describe('Environment', () => {
    it('Should be equal to process.env', () => {
      expect(typeof(process.env)).to.be.equal('object');
      env();
      expect(process.env).to.be.equal('development');
    })
  });
};