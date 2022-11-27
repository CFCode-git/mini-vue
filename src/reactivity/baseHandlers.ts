import { track, trigger } from './effect'

// 这里是为了复用 getter 函数，而不需要每次创建 proxy 的时候都创建一个新的 getter
const get = createGetter()
const readonlyGet = createGetter(true)
const set = createSetter()

function createGetter(isReadonly = false) {
  return function get(target, key) {
    let res = Reflect.get(target, key)

    // 依赖收集
    if (!isReadonly) track(target, key)

    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    let res = Reflect.set(target, key, value)

    // 触发依赖
    trigger(target, key)

    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target
    );
    return true
  }
}
