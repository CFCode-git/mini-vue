// emit 函数会挂载到 instance 中，最终作为 setup 第二个参数对象的一部分传给用户调用
// 用户调用的时候可以传 eventName,第一个参数 instance 由初始化的时候自动绑定，用户不需要传。
export function emit(instance, event,...args) {
  console.log('componentEmit函数')

  const { props } = instance
  // console.log(instance, props)

  // emit event: add > 对应App父组件中的子组件props中的: onAdd
  // 首字母大写
  const capitalize = str => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // event > onEvent
  const toHandlerKey = event => {
    return event ? 'on' + capitalize(event) : ''
  }

  const handlerKey = toHandlerKey(event)
  const handler = props[handlerKey]
  handler && handler(...args)
}
