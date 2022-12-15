import { createComponentInstance, setupComponent } from './component'
export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断类型
  // 判断是不是 element

  // 处理组件
  processComponent(vnode, container)
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  // 通过虚拟节点 vnode 创建组件实例对象 instance
  // 以便挂载 props slots 等组件相关的属性
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
  const subTree = instance.render() // 得到App.js中h函数生成的虚拟节点
  // vnode > patch
  // vnode > element > mountElement

  patch(subTree, container)
}
