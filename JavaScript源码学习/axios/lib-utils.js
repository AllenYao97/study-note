//
'use strict';

// module.exports = function bind(fn, thisArg) {
//   return function wrap() {
//     var args = new Array(arguments.length);
//     for (var i = 0; i < args.length; i++) {
//       args[i] = arguments[i];
//     }
//     return fn.apply(thisArg, args);
//   };
// };

/**
 * 这里把bind写在上面了，跟尤大写的对比
 * 区别：全部使用apply解决，没有考虑兼容问题
 */

var bind = require('./helpers/bind');

// utils is a library of generic helper functions non-specific to axios

//  这里写法还是跟尤大一样
var toString = Object.prototype.toString;

/**
 * axios支持的协议，http，https，file
 * file只能本地访问，不能跨域
 */
var supportedProtocols = ['http:', 'https:', 'file:'];

/**
 * 参数不为空， 返回 参数
 * 参数为空，   返回 http：
 *
 * @param {String} protocol The String value of URL protocol
 * @returns {String} Protocol if the value is not undefined or null
 */
function getProtocol (protocol) {
  return protocol || 'http:';
}

/**
 * 判断是否为数组
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray (val) {
  return Array.isArray(val);
}

/**
 * 与尤大不同，纯粹只考虑undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined (val) {
  return typeof val === 'undefined';
}

/**
 * 判断是否是Buffer
 * Buffer：缓冲区。  Node.js提供的二进制缓冲区，一般用于IO
 * 标准：
 *      1.不为null/undefined    
 *      2.构造函数不为null/undefined          ----> 所以还是把null考虑进去吧，哈哈哈
 *      3.存在isBuffer函数，并且可以直接用这个来判断
 * 
 * 步骤1，2只是为了3不报错 Cannot read property 'isBuffer' of undefined/null ; isBuffer is not a function
 *        
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer (val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * 判断是否是ArrayBuffer
 * ArrayBuffer：前端的通用二进制缓冲区，类似数据，但在API和特性上却有诸多不同
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer (val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * 判断是否是FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData (val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * 判断是否是ArrayBufferView
 * ArrayBuffer如果被定义，并且存在isView函数则直接用ArrayBuffer.isView
 * 否则用isArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView (val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * 判断是否是 string
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString (val) {
  return typeof val === 'string';
}

/**
 * 判断是否是 number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber (val) {
  return typeof val === 'number';
}

/**
 * 快速检查对象
 * 是否符合JSON
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject (val) {
  return val !== null && typeof val === 'object';
}

/**
 * 是否为纯对象
 * 与尤大相比，多了 判断目标对象的原型是不是`null` 或 `Object.prototype`
 * 能够避开 new function(){}   
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject (val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * 是否为Date对象
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate (val) {
  return toString.call(val) === '[object Date]';
}

/**
 * 是否是文件
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile (val) {
  return toString.call(val) === '[object File]';
}

/**
 * 是否是Blob
 * Blob：对象表示一个不可变、原始数据的类文件对象。它的数据可以按文本或二进制的格式进行读取。
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob (val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * 是否是函数
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction (val) {
  return toString.call(val) === '[object Function]';
}

/**
 * 是否是流
 *  对象且存在pipe函数
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream (val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * 是否是URLSearchParams
 * URLSearchParams ：https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams (val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * 类似python的strip，删除首位空格用
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim (str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * 判断标准浏览器环境，可以看到navigator已经弃用product属性了
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv () {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
    navigator.product === 'NativeScript' ||
    navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * 用一个函数 遍历数组/对象
 *
 * 如果是数组，cb会调用value, index, array
 *
 * 如果是对象，cb会调用value, key, object
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach (obj, fn) {
  // 没传参或者参数为空，noop
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // 如果不是obj，强制转成array
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // 循环调用fn
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // 遍历属性
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * 接受传参，期待每个参数都是 对象
 * 不改变原对象，合并每个对象属性，并返回结果
 * 当多个对象含有相同属性的时候，优先后者
 *  是对象就合并，是原始类型就覆盖，递归
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge (/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue (val, key) {
    // 如果该属性在前面出现过，且之前和现在都是纯对象，合并该属性下的对象
    // 否则，如果只有传入的参数是纯对象，直接与{}合并===>之前属性是原始类型的话，值就丢失了
    // 否则，如果传入的参数是array，用slice返回新数组，覆盖。   与上面{}合并 都是为了深拷贝
    // 否则，就是原始类型，直接覆盖就行=====> forEach是有强制转成数组的，所以不用担心其他情况
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  // 循环遍历每一个对象，  用forEach，使assignValue遍历每一个属性
  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * 把b拓展到A上
 *  如果属性是函数，且有需要绑定的对象，则直接返回bind
 *  否则直接赋值(不是深拷贝)
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend (a, b, thisArg) {
  forEach(b, function assignValue (val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * 删除UTF-8编码中的BOM
 *  BOM是全称是Byte Order Mark，它是一个Unicode字符，通常出现在文本的开头，用来标识字节序。
 *  所以BOM在UFT-8编码中根本无用
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM (content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * 使用object.create  把superConstructor的原型继承给constructor
 *                    把descriptors，添加到constructor.prototype中 
 * 如果有props，则把props浅拷贝到constructor.prototype上
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 */

function inherits (constructor, superConstructor, props, descriptors) {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  props && Object.assign(constructor.prototype, props);
}

/**
 * 把具有深层原型链的对象解析为平面对象
 *  Object.getOwnPropertyNames()
 *    返回一个由指定对象的所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性）组成的数组。
 * 如果目标没出现过资源的属性，则直接赋值，并标记，source指向原型，继续循环
 * 循环出口： 原型为空，原型===object.prototype， 
 *            !filter || filter(sourceObj, destObj) 暂时不清楚干啥的
 * 
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function} [filter]
 * @returns {Object}
 */

function toFlatObject (sourceObj, destObj, filter) {
  var props;
  var i;
  var prop;
  var merged = {};

  destObj = destObj || {};

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if (!merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

module.exports = {
  supportedProtocols: supportedProtocols,
  getProtocol: getProtocol,
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM,
  inherits: inherits,
  toFlatObject: toFlatObject
};


/**
 * 总结：
 *      1.isPlainObject 与尤大写的不同，增加了对原型是否为空，是否与Object.prototype相等,能够避开 new function(){}
 *      2.Object.create ; Object.assign   
 *      3.stripBOM
 */
