export const extend = Object.assign

export const isObject = val => {
  return val !== null && typeof val === 'object'
}

export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

// 首字母大写
const capitalize = str => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// event > onEvent
export const toHandlerKey = event => {
  return event ? 'on' + capitalize(event) : ''
}

// 烤肉串命名方式支持 add-foo > addFoo
export const camelize = (str: string) => {
  // _ 是匹配 -(/w) 的字符串，c是(\w)中括号提取出来的字符串
  return str.replace(/-(\w)/g, (_, c: string) => {
    // console.log('_:',_,'c:',c);
    return c ? c.toUpperCase() : ''
  })
}
