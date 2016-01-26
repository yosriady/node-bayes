var _ = require('underscore');
var math = require('mathjs');

var NaiveBayes = function(options) {
  options = options || {};

  if (_.isNull(options.columns) || _.isEmpty(options.columns)) {
    throw new Error('ValidationError: missing required argument: columns.');
  }
  if (_.uniq(options.columns).length !== options.columns.length) {
    throw new Error('ValidationError: column names must be unique.');
  }
  this.stripWhitespace = options.stripWhitespace || true;
  this.columns = this.stripWhitespace ? (_.map(options.columns, function(col) {return col.replace(/ /g,'');})) : options.columns;
  this.labelIndex = options.labelIndex || this.columns.length - 1;
  this.verbose = options.verbose || false;
  this.eagerTraining = options.eagerTraining || true;

  // Introspect column types of data
  if (options.columnTypes || !_.isEmpty(options.data)) {
    this.columnTypes = options.columnTypes || _.map(options.data[0], function(columnValue) {return typeof columnValue;});
  } else {
    throw new Error('Your data should at least contain one row, otherwise option columnTypes is required.');
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

var validateSample = function(data, columns, columnTypes, sample, options) {
  var errors = [];
  var options = options || {};

  // Validate sample attribute sizes are consistent
  if (!_.isEqual(columns.length, sample.length)) {
    errors.push('Expected number of columns is ' + columns.length +
                ', but sample has ' + sample.length);
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
      errors.unshift('Element at index ' + errors.length + ' has errors');
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
  var columnTypes = this.columnTypes;
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

  // Calculate conditional probability for each non-numeric column value and class pair
  _.each(_.uniq(labelValues), function(labelValue) {
    _.each(_.without(columns, columns[labelIndex]), function(column, columnIndex) {
      var isNumericColumn = (columnTypes[columnIndex] === 'number');
      if (isNumericColumn) {
        return;
      };

      frequencies[column] = frequencies[column] || {};
      probabilities[column] = probabilities[column] || {};

      var columnValues =  _.uniq(_.pluck(data, columnIndex));
      _.each(columnValues, function(columnValue) {
        frequencies[column][columnValue] = frequencies[column][columnValue] || {};
        probabilities[column][columnValue] = probabilities[column][columnValue] || {};
        var count = _.size(_.filter(data, function(sample) {
              return _.isEqual(sample[columnIndex], columnValue) &&
            _.isEqual(sample[labelIndex], labelValue);}));
        frequencies[column][columnValue][labelValue] = count;
        probabilities[column][columnValue][labelValue] = (count + 1) / (frequencies[labelKey][labelValue] + columnValues.length);
      });
    });
  });

  // Calculate frequencies, mean, standard deviation for numeric attributes
  var numericColumns = [];
  _.each(this.columnTypes, function(type, index) {
    var isNumericColumn = (columnTypes[index] === 'number');
    if (!isNumericColumn) {
      return;
    }
    numericColumns.push({name: columns[index], index: index});
  });
  _.each(numericColumns, function(obj) {
    var columnName = obj.name;
    var columnIndex = obj.index;
    frequencies[columnName] = {};
    probabilities[columnName] = {};

    // Froup columns values that by sample label
    _.each(_.uniq(labelValues), function(labelValue) {
      var samples = _.filter(data, function(sample) {return sample[labelIndex] === labelValue;});
      frequencies[columnName][labelValue] = _.pluck(samples, columnIndex);

      probabilities[columnName][labelValue] = {};
      probabilities[columnName][labelValue].mean = math.mean(frequencies[columnName][labelValue]);
      probabilities[columnName][labelValue].std = math.std(frequencies[columnName][labelValue]);
    });
  });

  this.frequencies = frequencies;
  this.probabilities = probabilities;
  this.trainedAt = Date.now();

  return true;
};

NaiveBayes.prototype.hasDirtySamples = function() {
  return _.isNull(this.trainedAt) || this.trainedAt < this.lastSampleAddedAt;
};

NaiveBayes.prototype.predict = function(sample) {
  var blindColumnValues = _.without(this.columns, this.columns[this.labelIndex]);
  var blindColumnTypes = this.columnTypes; blindColumnTypes.splice(this.labelIndex, 1);
  var errors = validateSample(this.data,
                              blindColumnValues,
                              blindColumnTypes,
                              sample,
                              {allowNull: true});
  if (!_.isEmpty(errors)) {
    throw new Error('ValidationError: ' + errors.join());
  };
  if (this.eagerTraining && this.hasDirtySamples) {
    this.train();
  }

  var answer = {};
  var columnTypes = this.columnTypes;
  var probabilities = this.probabilities;
  var attributeColumns = _.without(this.columns, this.columns[this.labelIndex]);
  _.each(attributeColumns, function(columnName, columnIndex) {
    var columnValueProbabilities = probabilities[columnName][sample[columnIndex]];

    // Calculate probabilities
    var isNumericColumn = (columnTypes[columnIndex] === 'number');
    if (isNumericColumn) {
      var sampleValue = sample[columnIndex];
      _.each(_.keys(probabilities[columnName]), function(labelValue) {
        if (_.isNull(labelValue)) { // Skipped columns
          answer[labelValue] = (answer[labelValue] * 1) || 1;
        };

        var obj = probabilities[columnName][labelValue];
        var mean = obj.mean;
        var std = obj.std;

        var probability = numericProbability(sampleValue, mean, std);
        answer[labelValue] = (answer[labelValue] * probability) || probability;
      });
    } else {
      _.each(_.keys(columnValueProbabilities), function(labelValue) {
        if (_.isNull(labelValue)) { // Skip calculation for null columns
          answer[labelValue] = (answer[labelValue] * 1) || 1;
        };

        answer[labelValue] = (answer[labelValue] * columnValueProbabilities[labelValue]) || columnValueProbabilities[labelValue];
      });
    }
  });

  var keys = _.keys(answer);
  var verboseAnswer = _.max(keys, function(k) { return answer[k];});

  if (!this.verbose) {
    return verboseAnswer;
  }

  answer.answer = verboseAnswer;
  return answer;
};

// Calculates probability of a numeric value
function numericProbability(value, mean, std) {
  return (1 / (std * math.sqrt(2 * math.pi))) *
                            math.pow(math.e,
                                     (-(math.pow(value - mean, 2)) /
                                      (2 * math.pow(std,2)))
                                    );
}

module.exports = {
  NaiveBayes: NaiveBayes
};
