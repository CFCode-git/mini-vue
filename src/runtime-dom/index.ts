import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, val) {
  // 约定事件绑定规范：判断是否以 on 开头
  const isOn = key => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    // onClick => 'click'
    el.addEventListener(key.slice(2).toLowerCase(), val)
  } else {
    el.setAttribute(key, val)
  }
}

function insert(el, parent) {
  parent.append(el)
}

// {createApp: createAppAPI(render)}
const renderer:any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
