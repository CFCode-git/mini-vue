import { getCurrentInstance } from './component'
export function provide(key, value) {
  // 存

  const currentInstance: any = getCurrentInstance()

  // getCurrentInstance 只能在 setup 函数中使用，provide 和 inject 两个函数也要在 setup 中使用
  // 这里要判断一下是否存在
  if (currentInstance) {
    const { provides } = currentInstance
    provides[key] = value
  }
}

export function inject(key) {
  // 取
  const currentInstance: any = getCurrentInstance()

  if (currentInstance) {
    return currentInstance.parent.provides[key]
  }
}
