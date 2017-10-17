// Require Chai.expect
const expect = require('chai').expect;

// Require moment extended
const env = require('./env');
const moment = require('./moment');
const events = require('./events');
const storage = require('./storage');
const url = require('./url');
// Test Mithril Component with o.spec

// Let's go
describe('Extension Time Recorder', () => {
  // Test Environment
  describe('Environment', env);
  // Test URL library
  describe('URL', url);
  // Test Moment extended functions
  describe('Moment', moment);
  // Test Storage
  describe('Storage', storage);
  // Test Events
  describe('Events', events);
});