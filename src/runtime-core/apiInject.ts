import { getCurrentInstance } from './component'
export function provide(key, value) {
  // 存

  const currentInstance: any = getCurrentInstance()

  // getCurrentInstance 只能在 setup 函数中使用，provide 和 inject 两个函数也要在 setup 中使用
  // 这里要判断一下是否存在
  if (currentInstance) {
    let { provides } = currentInstance

    let parent = currentInstance.parent

    // 如果组件调用了 provide, 那么就改写组件的 provides，将它的 provides 的原型指向父级的 provides;
    // 如果没有调用，那么直接使用来自父级的 provides 引用即可
    // 还要注意的一个问题是，这里的改写操作应该只有在该组件第一次调用 provide 的时候，也就是 init 的时候执行, 否则在第二次执行 provides 的时候会重新得到一个空对象， 丢失了第一次执行的赋值.

    // 判断依据是当前组件的 provides 和父级的 provides 相等，因为在初始化 Instance 的时候将父级的 provides 的引用传给了当前 Instance.
    // 如果两者相等 说明还没执行下面的 init 操作。
    if (provides === parent.provides) {
      provides = currentInstance.provides = Object.create(parent.provides) // Object.create(proto) 创建一个新对象，并且指定原型为 proto, 执行完毕后相当于会得到一个指定 proto 的空对象.
    }

    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  // 取
  const currentInstance: any = getCurrentInstance()

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides
    if (parentProvides[key]) {
      return parentProvides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
