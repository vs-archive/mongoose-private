mongoose-private
================

Mongoose plugin to provide private fields functionality

## Installation

```sh
$ npm install mongoose-private --save
```

## Documentation

### Enable plugin for model
  ```js
  var privates = require('mongoose-private');

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var AppleSchema = new Schema({
    code: { type: Number, private: true},
    color: String
  });

  AppleSchema.plugin(privates, schemaOptions);
  mongoose.model('Apples', AppleSchema, 'Apples');
  ```
  
### There are 3 possible ways of usage

1. Via Model method toJSON
    - explicit
    ```js
        var apple = new Apple({code:0x63, color: 'red'});
        var json = apple.toJSON(options); //{color: 'red'}
    ```
    - implicit
    ```js
        var apple = new Apple({code:0x64, color: 'green'});
        var jsonString = JSON.stringify(apple); //"{"color":"green"}"
    ```
2. Via omitPrivatePaths static schema method
    ```js
        var apple = {code:0x65, color: 'yellow'};
        var json = Apple.omitPrivatePaths(apple); //{color: 'yellow'}
    ```
3. Via toProjection static schema method
    ```js
        Apple.findOne({color: 'red'}, Apple.toProjection(options))
            .lean().exec(fn);
        Bucket.find({}, Bucket.toProjection())
            .populate('apples', Apple.toProjection(options))
            .lean().exec(fn);
    ```

### Possible options

1. You can provide options in method call
    - omit: *String or Array* - if you need to omit in JSON any additional field
    - pick: *String or Array* - if you need to include in JSON any additional field

    ```js
        var apple = new Apple({code:0x63, color: 'red'});
        var json = apple.toJSON({omit:['color'], pick:['code']}); //{code: '0x63'}
    ```

2. You can provide options at schema level
    ```js
    ApplesSchema.plugin(privates, schemaOptions);
    ```

## License

Copyright (c) 2014 Valorkin &lt;valorkin@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Credits
Inspired by https://github.com/yamadapc/mongoose-private-paths
But configuration is over convention.