// emit 函数会挂载到 instance 中，最终作为 setup 第二个参数对象的一部分传给用户调用

import { camelize, toHandlerKey } from "../shared/index"

// 用户调用的时候可以传 eventName,第一个参数 instance 由初始化的时候自动绑定，用户不需要传。
export function emit(instance, event, ...args) {
  console.log('componentEmit函数')

  const { props } = instance
  // console.log(instance, props)


  const handlerKey = toHandlerKey(camelize(event))
  const handler = props[handlerKey]
  handler && handler(...args)
}
