var bayes = require('../index.js');

var TRAINING_COLUMNS = ['weather', 'temperature', 'humidity', 'wind', 'play?'];
var TRAINING_DATA_SIMPLE = [
    ['Sunny','Hot','High','Weak','No'],
    ['Sunny','Hot','High','Strong','No'],
    ['Overcast','Hot','High','Weak','Yes'],
    ['Rain','Mild','High','Weak','Yes'],
    ['Rain','Cool','Normal','Weak','Yes'],
    ['Rain','Cool','Normal','Strong','No'],
    ['Overcast','Cool','Normal','Strong','Yes'],
    ['Sunny','Mild','High','Weak','No'],
    ['Sunny','Cool','Normal','Weak','Yes'],
    ['Rain','Mild','Normal','Weak','Yes'],
    ['Sunny','Mild','Normal','Strong','Yes'],
    ['Overcast','Mild','High','Strong','Yes'],
    ['Overcast','Hot','Normal','Weak','Yes'],
    ['Rain','Mild','High','Strong','No']
];
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

// Non-numeric attributes
var cls = new bayes.NaiveBayes({
  columns: TRAINING_COLUMNS,
  data: TRAINING_DATA_SIMPLE,
  verbose: true
});
cls.train();
var answer = cls.predict(['Sunny', 'Cool', 'High', 'Strong']);
console.log(cls.frequencies);
console.log(answer);

// Numeric attributes
var cls = new bayes.NaiveBayes({
  columns: TRAINING_COLUMNS,
  data: TRAINING_DATA,
  verbose: true
});
cls.train();
var answer = cls.predict(['Sunny', 66, 90, 'Strong']);
console.log(answer);
