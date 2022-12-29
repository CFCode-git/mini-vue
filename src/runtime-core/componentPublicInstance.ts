const publicPropertiesMap = {
  $el: instance => instance.vnode.el
}

export const PublicInstanceProxyHandler = {
  get({ _: instance }, key) {
    // 从 setupState 中获取
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
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
