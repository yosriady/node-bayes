var NaiveBayes = function(options) {
  options = options || {};
  this.columns = options.columns || {};
  this.data = options.data || {};
  this.verbose = options.verbose || false;
};

NaiveBayes.prototype.train = function() {

};

NaiveBayes.prototype.classify = function() {

};

module.exports = {
  NaiveBayes: NaiveBayes
};
