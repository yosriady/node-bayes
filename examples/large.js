var bayes = require('../index.js');
var d3 = require('d3');
fs = require('fs');


fs.readFile('./test/fixtures/car_evaluation.csv', 'utf8', function (err,csvString) {
  if (err) {
    return console.log(err);
  }

  var DATA = d3.csv.parseRows(csvString);
  var cls = new bayes.NaiveBayes({
    columns: DATA[0],
    data: DATA.slice(1),
    verbose: true
  });
  cls.train();
});
