var assert = require('assert');
var bayes = require('../index.js');

var TRAINING_COLUMNS = ['weather', 'temperature', 'humidity', 'wind', 'play?'];
var TRAINING_DATA = [
            ['Sunny',85,85,'Weak','No'],
            ['Sunny',80,90,'Strong','No'],
            ['Overcast',83,86,'Weak','Yes'],
            ['Rain',70,96,'Weak','Yes'],
            ['Rain',68,80,'Weak','Yes'],
            ['Rain',65,70,'Strong','No'],
            ['Overcast',64,65,'Strong','Yes'],
            ['Sunny',72,95,'Weak','No'],
            ['Sunny',69,70,'Weak','Yes'],
            ['Rain',75,80,'Weak','Yes'],
            ['Sunny',75,70,'Strong','Yes'],
            ['Overcast',72,90,'Strong','Yes'],
            ['Overcast',81,75,'Weak','Yes']
        ];

describe('NaiveBayes', function() {
  describe('new()', function() {
    it('should initialize correctly on valid input', function() {
      var cls = new bayes.NaiveBayes({
        columns: TRAINING_COLUMNS,
        data: TRAINING_DATA
      });
      cls.add(['Rain',71,91,'Strong','No']);
    });

    it('should throw error on invalid input', function() {
      assert.throws(function() {
        return new bayes.NaiveBayes({
          columns: TRAINING_COLUMNS,
          data: [['Rain',71,91,'Strong','No'],
                 ['Sunny','95','Weak','No']]
        });
      }, Error);
    });

    it('should validate sizes', function() {
      var cls = new bayes.NaiveBayes({
        columns: ['weather', 'temperature', 'humidity', 'wind', 'play?'],
        data: [
          ['Sunny',85,85,'Weak','No']
        ]
      });

      assert.throws(function() { cls.add(['Rain',71,91]);},
                    Error);
    });
  });
});
