/*
  Return current environment
 */
const dev = 'development';
const prod = 'production';

module.exports = () => {
  process.env = process.env == prod ? prod : dev;
};