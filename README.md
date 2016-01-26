node-bayes
========

> node-bayes is a Naive Bayes classifier for Node.js. Built-in support for numeric attributes and Laplace smoothing.

## Getting Started

```
npm install node-bayes
```

```
var bayes = require('node-bayes');
```

## Example Usage

```
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
```

## Options

| Option        | Type     | Description                                                                                                                                                    |
|---------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| data*         | type[]   | Your dataset, an array of arrays. Every sample must have consistent size and type signature.                                                                   |
| columns*      | string[] | Column names of your dataset. Must be unique.                                                                                                                  |
| labelIndex    | integer  | Index of your class label. Defaults to rightmost column.                                                                                                       |
| verbose       | boolean  | If set to true, returns full probability breakdown for each class value. Defaults to false.                                                                    |
| eagerTraining | boolean  | If set to true, runs train() on predict() if there are dirty samples.                                                                                          |
| columnTypes   | string[] | ColumnTypes of your dataset. Used for validation of samples in your dataset. If not supplied, the column types of the first sample is inspected automatically. |
| stripWhitespace | boolean  | If set to true, whitespace in column names are stripped. Defaults to true.

## Running Tests

```
npm test
```

##License

(The MIT License)

Copyright (c) 2016 Yos Riady &lt;yosriady@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.