import { render } from "./renderer"
import { createVNode } from "./vnode"

/**
 *
 * @param rootComponent 根组件
 * @returns
 */
export function createApp(rootComponent) {
  return {
    /**
     *
     * @param rootContainer 根容器
     */
    mount(rootContainer) {
      // 先转换成虚拟节点 vnode
      // 后续所有的逻辑操作都基于 vnode 进行处理
      const vnode = createVNode(rootComponent)

      render(vnode,rootContainer)
    }
  }
}
