import { hasOwn } from '../shared/index'

const publicPropertiesMap = {
  $el: instance => instance.vnode.el,
  $slots: instance => instance.slots
}

export const PublicInstanceProxyHandler = {
  get({ _: instance }, key) {
    // 从 setupState 中获取
    const { setupState, props } = instance

    /*     
    if (key in setupState) {
      return setupState[key]
    } 
    */
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    // 处理 $el
    if (publicGetter) {
      return publicGetter(instance)
    }

    // $data > options API
    // 处理 $options ...
  }
}
