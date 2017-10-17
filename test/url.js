// Require Chai.expect
const expect = require('chai').expect;

// Require moment extended
const URL = require('./../src/scripts/allegro/url');

module.exports = () => {
  // Test Moment shortcuts
  describe('URL', () => {
    it('QueryParams tests', () => {
      const param = URL.getQueryParams('?foo=bar');
      expect(param.foo).to.be.equal('bar');
    })
  });
};