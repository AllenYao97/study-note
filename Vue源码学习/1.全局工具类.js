// 路径：/src/shared/util
/* @flow */

export const emptyObject = Object.freeze({})
// 创建一个空对象，并且将它冻结。freeze，ES5语法，无法改变对象，

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.

// 是否未定义，这边显然是把null也当成未定义了
export function isUndef (v: any): boolean % checks {
  return v === undefined || v === null
}

// 是否已定义
export function isDef (v: any): boolean % checks {
  return v !== undefined && v !== null
}

// 是否为boolean true
export function isTrue (v: any): boolean % checks {
  return v === true
}

// 是否为boolean false
export function isFalse (v: any): boolean % checks {
  return v === false
}

/**
 *  JavaScript中6个假值
 *  false,null,undefined,0,"",NaN
 *  其中 0==false，''==false, 0==''
 *      null==undefined               为TRUE
 *  巨坑 0==[],''==[],[]==false, 但是[]不是假值
 *  []==![] ===》true
 * 
 *  这里主要是因为 任意值与布尔值比较，都会将两边的值转化为Number
 *  Number([])=0
 *  所以 ![] = false, 回到[]==false,为TRUE
 */


/**
 * 是否为原始类型，这里估计是上面已经对null，undefined做了细分，没写进去
 * 但是为什么又加入了boolean就不得而知了
 */
export function isPrimitive (value: any): boolean % checks {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * 快速检查对象
 * 可以用来检查是否符合JSON
 * typeof null => object
 */
export function isObject (obj: mixed): boolean % checks {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 * 
 * Object.prototype.toString ( )
 * 当调用 toString 方法，采用如下步骤：
 * 1.如果 this 的值是 undefined, 返回 "[object Undefined]".
 * 2.如果 this 的值是 null, 返回 "[object Null]".
 * 3.令 O 为以 this 作为参数调用 ToObject 的结果 .
 * 4.令 class 为 O 的 [[Class]] 内部属性的值 .
 * 5.返回三个字符串 "[object ", class, and "]" 连起来的字符串 .
 * 
 */
const _toString = Object.prototype.toString

/**
 * 实现一个类似typeof的功能，
 * 但是 toRawType(null)--->Null
 * 具体还有一些区别，详细参考https://262.ecma-international.org/6.0/#sec-object.prototype.tostring
 */
export function toRawType (value: any): string {
  return _toString.call(value).slice(8, -1)
}

/**
 * 严格的对象检查，为了区分array
 */
export function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}

/**
 * 是否是正则表达式
 */
export function isRegExp (v: any): boolean {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * 判断是否是合理的索引
 *  >0
 * 返回一个浮点数，Math.floor(n)===n 向下取整仍相等即小数部分为0
 * isFinite，是否为有限数值  
 */
export function isValidArrayIndex (val: any): boolean {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * 是否为promise
 * isDef是为了避免报错 Cannot read property 'xxx' of undefined/null
 */
export function isPromise (val: any): boolean {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * 转字符串
 * 如果是数组/对象的toString是Object.prototype.toString，就用JSON.stringify
 * JSON.stringify(value[, replacer[, space]])
 * space:缩进
 */
export function toString (val: any): string {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * 字符串转数字，如果转换失败，返回原字符串
 */
export function toNumber (val: string): number | string {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

/**
 * 传入一个以逗号分隔的字符串，生成一个 map(键值对)，并且返回一个函数检测 key 值在不在这个 map 中。
 * 第二个参数是小写选项。
 * 
 * Object.create(null)   超轻量对象，原型链没有上一层
 * let isMyName = makMap('a,b,c,d);
 * isMyName('a')  // true
 * 
 * 用到了闭包，箭头函数
 * 
 */
export function makeMap (
  str: string,
  expectsLowerCase?: boolean
): (key: string) => true | void {
  const map = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * 是否为vue内置的tag，即是否为slot，component
 */
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * 是否为vue保留属性，key，ref，slot，slot-scope，is
 */
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

/**
 * 从数组中移除某一项
 * 能移除的返回移除后的数组，不能移除的就void
 * axios中拦截器也是用数组，当删除拦截器某一项时候直接把那一项置为null
 * 因为splice性能消耗大，删一个需要移动所有后面的
 */
export function remove (arr: Array<any>, item: any): Array<any> | void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * 检查是否拥有自己的属性（不是方法），不查原型链，即不查继承
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}

/**
 * 缓存数据,这里是指传入函数fn的返回集的缓存，如果fn没有返回值，则不能起到缓存作用
 * 还是闭包，尤大这里又不用箭头函数了
 * 
 */
export function cached<F: Function> (fn: F): F {
  const cache = Object.create(null)
  return (function cachedFn (str: string) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }: any)
}

/**
 * 连字符转小驼峰
 * 小驼峰，第一个字母小写
 * 大驼峰，第一个字母也大写
 * 用了缓存
 */
const camelizeRE = /-(\w)/g
export const camelize = cached((str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * 首字母转大写
 * 用了缓存
 */
export const capitalize = cached((str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * 小驼峰转连字符
 * 用了缓存
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached((str: string): string => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

/**
 * 目的就是为了兼容旧版本无bind
 * 如果原型链上有bind则用bind，如果没有bind则用call和apply实现bind
 */

/* istanbul ignore next */
function polyfillBind (fn: Function, ctx: Object): Function {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length
  return boundFn
}

function nativeBind (fn: Function, ctx: Object): Function {
  return fn.bind(ctx)
}

export const bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind

/**
 * 把类数组转成数组，参数start表示从第几个开始
 * 
 */
export function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * 对象合并，并且返回to
 */
export function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * 对象数组转obj，这边做法是把array合并到一个空对象中
 */
export function toObject (arr: Array<any>): Object {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * 空函数，类似python的pass，主要是避免传入undefined之类的数据而导致代码报错
 * 具体例子：vue中Watcher，如果call不做操作就需要传入空函数，如果传undefined就会报错，cb is no a function
 * 在vue中更多是为了不让flow使用rest操作符... 产生无用的转换代码
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop (a?: any, b?: any, c?: any) { }

/**
 * 一直返回false
 */
//  TODO:具体存在意义还需要研究
export const no = (a?: any, b?: any, c?: any) => false

/* eslint-enable no-unused-vars */

/**
 * 返回自己
 */
export const identity = (_: any) => _

/**
 * 从编译器模块中生成静态的 键 字符串
 * 接收一个模块数组？
 * 用reduce把每个模块中的staticKeys加入Keys，Keys的初始值为[]
 * 用join数组转字符串
 * Array.reduce(fn(res,num),initRes)
 */
// TODO:暂时不是很清楚是干啥的
export function genStaticKeys (modules: Array<ModuleOptions>): string {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * 判断A,B是否内容相等 ，宽松相等
 * 严格相等肯定相等
 * 如果A,B都是对象  
 *    Array 就递归遍历
 *    Date  就getTime，直接比时间戳 
 *    Object 这里得排除一个是Array一个是Obj的情况，跟数组一样递归遍历
 * 如果A,B都不是对象直接转成字符串比较，相等就宽松相等
 * 否则就不相等
 */
export function looseEqual (a: any, b: any): boolean {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * 宽松的indexOf，基于looseEqual
 */
export function looseIndexOf (arr: Array<mixed>, val: mixed): number {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * 确保函数只执行一次
 */
export function once (fn: Function): Function {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}

/**
 * 生命周期等
 */
var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

/*  */