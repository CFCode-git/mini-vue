import { extend, isObject } from '../shared'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly, shallowReadonly } from './reactivity';

// 这里是为了复用 getter 函数，而不需要每次创建 proxy 的时候都创建一个新的 getter
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {

    // 处理 isReadonly 和 isReactive 的调用
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    let res = Reflect.get(target, key)

    if(shallow){
      return res
    }

    // 如果是shallow, 不需要递归对嵌套对象执行
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }

    // 依赖收集, 如果是readonly, 不需要收集依赖
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
    console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target)
    return true
  }
}


// 通过 extends(Object.assign) 改写 readonlyHandlers 的 getter 方法
export const shallowReadonlyHandlers = extend({},readonlyHandlers,{
  get: shallowReadonlyGet
})