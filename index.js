var _ = require('underscore');

var NaiveBayes = function(options) {
  options = options || {};

  if (_.isNull(options.columns) || _.isEmpty(options.columns)) {
    throw new Error('ValidationError: missing required argument: columns.');
  }
  this.columns = options.columns;
  this.labelIndex = options.labelIndex || this.columns.length - 1;
  this.verbose = options.verbose || false;
  this.eagerTraining = options.eagerTraining || true;

  // Introspect column types of data
  if (!_.isEmpty(options.data)) {
    this.columnTypes = _.map(options.data[0], function(columnValue) {return typeof columnValue;});
  } else {
    throw new Error('Your data should at least contain one row. Data cannot be empty.');
  }

  // Validate every sample in data
  var errors = validateSamples(options.data, this.columns, this.columnTypes);
  if (_.isEmpty(errors)) {
    this.data = options.data;
    this.lastSampleAddedAt = Date.now();
  } else {
    throw new Error('ValidationError: ' + errors.join());
  }
  this.probabilities = {};
  this.frequencies = {};
  this.trainedAt = null;
};

NaiveBayes.prototype.add = function(sample) {
  var errors = validateSample(this.data, this.columns, this.columnTypes, sample);
  if (_.isEmpty(errors)) {
    this.data.push(sample);
  } else {
    throw new Error('ValidationError: ' + errors.join());
  }
};

var validateSample = function(data, columns, columnTypes, sample) {
  var errors = [];

  // Validate sample attribute sizes are consistent
  if (!_.isEqual(columns.length, sample.length)) {
    errors.push('Expected number of columns is ' + columns.length +
                ', but sample has ' + sample.length);
  }

  // Compare the types samples, based on first sample
  if (!_.isEmpty(data)) {
    _.each(columnTypes, function(expectedType, index) {
      var actual = typeof sample[index];
      if (!_.isEqual(expectedType, actual)) {
        errors.push('Expected type of attribute ' + columns[index] +
                    ' at index ' + index + ' to be ' + expectedType + ' but is ' +
                    actual);
      }
    });
  }
  return errors;
};

var validateSamples = function(data, columns, columnTypes) {
  var errors = [];
  if (_.isEmpty(data)) {
    return [];
  }
  var fault = _.find(data, function(sample) {
    errors = validateSample(data, columns, columnTypes, sample);

    if (!_.isEmpty(errors)) {
      errors.unshift('Element at index ' + index + ' has errors');
      return true;
    }

    return false;
  });

  return errors;
};

NaiveBayes.prototype.isValid = function() {
  var errors = validateSamples(this.data, this.columns);
  if (_.isEmpty(errors)) {
    return true;
  } else {
    throw new Error('ValidationError: ' + errors.join());
  }
};

NaiveBayes.prototype.train = function() {
  var frequencies = {};
  var probabilities = {};
  var labelIndex = this.labelIndex;
  var columns = this.columns;
  var data = this.data;
  var labelValues = _.map(data, function(sample) {
    return sample[labelIndex];
  });
  var labelKey = columns[labelIndex];

  // Calculate class frequencies/probabilities
  frequencies[labelKey] = _.countBy(data, function(sample) {
    return sample[labelIndex];
  });
  probabilities[labelKey] = _.mapObject(frequencies[labelKey], function(v, k) {
    return v / data.length;
  });

  // Calculate conditional probability for each column value and class pair
  _.each(_.uniq(labelValues), function(labelValue) {
    _.each(_.without(columns, columns[labelIndex]), function(column, columnIndex) {
      frequencies[column] = frequencies[column] || {};
      probabilities[column] = probabilities[column] || {};

      var columnValues =  _.uniq(_.pluck(data, columnIndex));
      _.each(columnValues, function(columnValue) {
        frequencies[column][columnValue] = frequencies[column][columnValue] || {};
        probabilities[column][columnValue] = probabilities[column][columnValue] || {};

        // todo: numeric attributes

        // non-numeric attributes
        var count = _.size(_.filter(data, function(sample) {
          return _.isEqual(sample[columnIndex], columnValue) &&
        _.isEqual(sample[labelIndex], labelValue);}));
        frequencies[column][columnValue][labelValue] = count;
        probabilities[column][columnValue][labelValue] = (count + 1) / (frequencies[labelKey][labelValue] + columnValues.length);
      });
    });
  });

  this.frequencies = frequencies;
  this.probabilities = probabilities;
  this.trainedAt = Date.now();

  return true;
};

NaiveBayes.prototype.hasdirtySamples = function() {
  return _.isNull(this.trainedAt) || this.trainedAt < this.lastSampleAddedAt;
};

NaiveBayes.prototype.predict = function(sample) {
  if (this.eagerTraining && this.hasdirtySamples) {
    this.train();
  }

  var answer = {};
  var probabilities = this.probabilities;
  _.each(_.without(this.columns, this.columns[this.labelIndex]), function(column, index) {
    var columnValueProbabilities = probabilities[column][sample[index]];
    _.each(_.keys(columnValueProbabilities), function(labelValue) {
      answer[labelValue] = (answer[labelValue] * columnValueProbabilities[labelValue]) || columnValueProbabilities[labelValue];
    });
  });

  if (this.verbose) {
    var keys = _.keys(answer);
    var verboseAnswer = _.max(keys, function(k) { return answer[k];});
    return verboseAnswer;
  }

  return answer;
};

module.exports = {
  NaiveBayes: NaiveBayes
};
