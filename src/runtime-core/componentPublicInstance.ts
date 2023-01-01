const publicPropertiesMap = {
  $el: instance => instance.vnode.el
}

export const PublicInstanceProxyHandler = {
  get({ _: instance }, key) {
    // 从 setupState 中获取
    const { setupState, props } = instance
    // if (key in setupState) {
    //   return setupState[key]
    // }

    const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

    if(hasOwn(setupState,key)){
      return setupState[key]
    }else if(hasOwn(props,key)){
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
