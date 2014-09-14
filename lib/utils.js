'use strict';
var _ = require('lodash');

function MongoosePrivateUtils() {
}

MongoosePrivateUtils.prototype.updatePaths = function(paths, options){
  options = _.merge({omit: [], pick: []}, options);

  if (!Array.isArray(options.omit)) {
    options.omit = options.omit.split(' ');
  }

  if (!Array.isArray(options.pick)) {
    options.pick = options.pick.split(' ');
  }

  return !options ? paths :
    _.merge({}, paths,
      this.toPaths(options.omit, true),
      this.toPaths(options.pick, false));
};

MongoosePrivateUtils.prototype.toProjection = function toProjection(pathes, parent) {
  var self = this;
  if (parent && !Array.isArray(parent)){
    parent = [parent];
  }

  return _.map(pathes, function (isPrivate, path) {
    if (isPrivate === true || isPrivate === false) {
      if (parent && parent.length){
        return sign(isPrivate) + [parent.join('.'), path].join('.');
      }

      return sign(isPrivate) + path;
    }
    return self.toProjection(isPrivate, path);
  });

  function sign(minus){
    return minus ? '-' : '';
  }
};

MongoosePrivateUtils.prototype.nestedOmit = function nestedOmit(doc, paths) {
  return _.reduce(doc, function (json, docValue, pathName) {
    var omit = paths[pathName], t;

    // 
    if (omit === true) {
      return json;
    }

    if (!omit) {
      json[pathName] = docValue;
      return json;
    }

    if (!_.isObject(omit)) {
      // this is not possible but anyway
      return json;
    }

    if (_.isArray(docValue)) {
      json[pathName] = _.map(docValue, function (arrValue) {
        return nestedOmit(arrValue, omit);
      });
      return json;
    }

    if (_.isObject(docValue)) {
      t = nestedOmit(docValue, omit);
      !_.isEmpty(t) && (json[pathName] = t);
    }

    return json;
  }, {});
};

MongoosePrivateUtils.prototype.toPaths = function toPaths(arr, val) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return {};
  }

  var paths = {};
  for (var i = 0; i < arr.length; i++) {
    paths[arr[i]] = val;
  }

  return unFlatten(paths, val);
};

/**
 * Returns an object with private fields list to omit
 * @param schema - mongoose schema for collection
 * @param options - call options
 * @returns {*}
 */
MongoosePrivateUtils.prototype.getPaths = function getPaths(schema, options) {
  var self = this;
  var paths = _.reduce(schema.paths, function (result, pathSchema, path) {

    // Nested schema
    if (pathSchema.schema) {
      var opts = _.merge({_parents: path}, options);
      var nestedPaths = self.getPaths(pathSchema.schema, opts);
      // if has private fields in nested schema
      if (Object.keys(nestedPaths).length > 0) {
        result[path] = nestedPaths;
      }

      return result;
    }

    // Array
    if (Array.isArray(pathSchema.options.type) &&
      (self.include(pathSchema, path, options) ||
      self.include({options: pathSchema.options.type[0]}, path, options))) {
      result[path] = true;
      return result;
    }

    if (self.include(pathSchema, path, options)) {
      result[path] = true;
    }

    return result;
  }, {});
  return unFlatten(paths, true);
};

/**
 * Returns true for private fields
 * @param pathSchema - mongoose schema for path
 * @param path - path name
 * @param options - call options
 * @returns {boolean}
 */
MongoosePrivateUtils.prototype.include = function include(pathSchema, path, options) {
  if (options._parents) {
    // for generic code believers:
    // Array.prototype.concat.call(options._parents.split('.'), path.split('.')).join('.')
    path = options._parents + '.' + path;
  }

  if (options.pick.indexOf(path) !== -1) {
    return false;
  }

  if (options.omit.indexOf(path) !== -1) {
    return true;
  }

  return pathSchema.options.private === true;
};

module.exports = new MongoosePrivateUtils();

/**
 Private utils
 */

/**
 * unFlatten + unwrap -> Converts 'it.is.pr':true to {it:{is:{pr:true}}}
 * @param paths
 * @param val{Boolean} - omit(true) or pick(false) path
 * @returns {*}
 */
function unFlatten(paths, val) {
  _.forEach(paths, function (value, path) {
    if (path.indexOf('.') === -1) {
      if (value === true) {
        return;
      }

      return unFlatten(value, val);
    }

    delete paths[path];
    var sub = path.split('.');
    return unwrap(paths, sub[0], sub.slice(1), val);
  });

  return paths;
}

/**
 * Extends memo in depth
 * @param memo{Object} - path to extend
 * @param path{String} - path name
 * @param sub{Array} - sub paths array
 * @param val{Boolean} - val{Boolean} - omit(true) or pick(false) path
 * @returns {*}
 */
function unwrap(memo, path, sub, val) {
  // for nested private objects
  if (memo[path] === true || memo[path] === false) {
    return memo;
  }

  if (sub.length === 0) {
    memo[path] = val;
    return ( memo );
  }

  if (!memo[path]) {
    memo[path] = {};
  }

  memo[path] = unwrap(memo[path], sub[0], sub.slice(1), val);
  return ( memo );
}