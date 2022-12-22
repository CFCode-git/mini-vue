import { createComponentInstance, setupComponent } from './component'
import { isObject } from '../shared/index'
export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断 vnode 类型
  // 判断是不是 element

  if (typeof vnode.type === 'string') {
    // 处理 element
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // 处理组件
    processComponent(vnode, container)
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type)

  // children
  const { children } = vnode
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(children, el)
  }

  // props
  const { props } = vnode
  for (const key in props) {
    el.setAttribute(key, props[key])
  }

  container.append(el)
}

function mountChildren(children: any[], el: any) {
  for (const child of children) {
    patch(child, el)
  }
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
