'use strict';

var _ = require('lodash');

var utils = require('./utils');

module.exports = function (schema, options) {
  options = _.merge({omit: [], pick: []}, options);
  var privatePaths = utils.getPaths(schema, options);
  utils.updatePaths(privatePaths, options);

  var toJSON = schema.methods.toJSON;

  var omitPrivatePaths = function (doc, options/*, ...*/) {
      var args = Array.prototype.slice.call(arguments, 1);
      var obj = (toJSON || doc.toObject || function () {
        return this;
      })
        .apply(doc, args);

      var _paths = utils.updatePaths(privatePaths, options);

      // omit all private paths
      return utils.nestedOmit(obj, _paths);
    };

  function toProjection(options){
    var _paths = utils.updatePaths(privatePaths, options);
    return _.flatten(utils.toProjection(_paths)).join(' ');
  }

  schema.methods.toJSON = function toJsonWrapper(/*options, ...*/) {
    var args = Array.prototype.concat.apply(this, arguments);
    return omitPrivatePaths.apply(this.constructor, args);
  };
  schema.statics.omitPrivatePaths = omitPrivatePaths;
  schema.statics.toProjection = toProjection;
  schema._privatePaths = toProjection({});
};
