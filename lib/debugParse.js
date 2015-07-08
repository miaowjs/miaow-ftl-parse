module.exports = function (option, cb) {
  if (!option.debug) {
    return cb();
  }

  this.contents = new Buffer('<#assign __debug__ = true />' + this.contents.toString());
  return cb();
};
