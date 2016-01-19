var _ = require('underscore');

var NaiveBayes = function(options) {
  options = options || {};

  if (_.isNull(options.columns) || _.isEmpty(options.columns)) {
    throw new Error('ValidationError: missing required argument: columns.');
  }
  this.columns = options.columns;
  this.labelIndex = options.labelIndex || this.columns.length - 1;
  this.verbose = options.verbose || false;

  // Validate every sample in data
  var errors = validateSamples(options.data, this.columns);
  if (_.isEmpty(errors)) {
    this.data = options.data || [];
  } else {
    throw new Error('ValidationError: ' + errors.join());
  }
};

NaiveBayes.prototype.add = function(sample) {
  var errors = validateSample(this.data, this.columns, sample);
  if (_.isEmpty(errors)) {
    this.data.push(sample);
  } else {
    throw new Error('ValidationError: ' + errors.join());
  }
};

var validateSample = function(data, columns, sample) {
  var errors = [];

  // Validate sample attribute sizes are consistent
  if (!_.isEqual(columns.length, sample.length)) {
    errors.push('Expected number of columns is ' + columns.length +
                ', but sample has ' + sample.length);
  }

  // Compare the types of the first sample in data and the current sample
  if (!_.isEmpty(data)) {
    _.each(data[0], function(attribute, index) {
      var expected = typeof attribute;
      var actual = typeof sample[index];
      if (!_.isEqual(expected, actual)) {
        errors.push('Expected type of attribute ' + columns[index] +
                    ' at index ' + index + ' to be ' + expected + ' but is ' +
                    actual);
      }
    });
  }
  return errors;
};

var validateSamples = function(data, columns) {
  var errors = [];
  if (_.isEmpty(data)) {
    return [];
  }
  var fault = _.find(data, function(sample) {
    errors = validateSample(data, columns, sample);

    if (!_.isEmpty(errors)) {
      errors.unshift('Element at index ' + index + ' has errors');
      return true;
    }

    return false;
  });

  return errors;
};

NaiveBayes.prototype.train = function() {
  // TODO:
  // 1. first, find the probabilities for each multiclass value Vj
  // 2. Then, find the conditional probability for each attribute value and multiclass value ai * Vj
  var labels = _.map(this.data, function(sample) {
    return sample[this.labelIndex];
  });

};

NaiveBayes.prototype.classify = function() {
  // TODO
};

module.exports = {
  NaiveBayes: NaiveBayes
};
