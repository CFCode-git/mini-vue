import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
export function render(vnode, container) {
  // patch
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  const { shapeFlag, type } = vnode

  switch (type) {
    // 处理 Fragment 比如 slots
    case Fragment:
      // 如果 type 不是 div / p 等标签节点而是 Fragment，那么只需要 mount vnode.children
      processFragment(vnode, container, parentComponent)
      break
    // 处理文本节点, children: string
    case Text:
      processText(vnode, container)
      break
    default:
      // 判断 vnode 类型
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 element
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container, parentComponent)
      }
      break
  }
}

// slots 走 mountFragment 逻辑 只 mountChildren, 此时的 vnode 就是 slots 数组
function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}

function processText(vnode, container) {
  const { children } = vnode

  const textNode = (vnode.el = document.createTextNode(children))

  container.append(textNode)
}

function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type))

  // children
  const { children, shapeFlag } = vnode

  /*
    if (typeof children === 'string') {
      el.textContent = children
    } else if (Array.isArray(children)) {
      mountChildren(children, el)
    }
  */

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 通过 与运算 查找判断 xxxx & 0100 得到  0100【十进值 4】或者 0000【十进值 0】
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }

  // props
  const { props } = vnode
  for (const key in props) {
    let val = props[key]
    // 约定事件绑定规范：判断是否以 on 开头
    const isOn = key => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      // onClick => 'click'
      el.addEventListener(key.slice(2).toLowerCase(), val)
    } else {
      el.setAttribute(key, val)
    }
  }

  container.append(el)
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => {
    patch(v, container, parentComponent)
  })
  // for (const child of children) {
  //   patch(child, container)
  // }
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(vnode: any, container, parentComponent) {
  // 通过虚拟节点 vnode 创建组件实例对象 instance
  // 以便挂载 props slots 等组件相关的属性
  const instance = createComponentInstance(vnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance: any, initialVNode, container) {
  const { proxy } = instance
  // 将 proxy 对象作为 render 函数的 this >>> render 函数内访问 this.msg / this.$el / ....
  const subTree = instance.render.call(proxy) // 得到App.js中h函数生成的虚拟节点

  // 只有组件类型的 vnode 才会走到这里。
  // subTree 是当前 component 的 instance 执行 render 后返回的 vnode 节点, 比如
  //   h("div",{},[child1,child2]) 节点本身是 element 类型，会直接挂载到上一级container中
  // 而在挂载前，根据 child1 和 child2 的类型又会用 patch 处理，同时 instance 也会向下传递.
  // 将 subTree 扔给 patch，会对内部的节点根据类型(element/component/..)再次处理
  patch(subTree, container, instance) // 这里的 parentComponent 是 instance 要仔细理解

  // (A). 第一次 Instance 是 App 组件, subTree 是 App 组件的 render 执行后返回的节点: h("div",{},[p标签,Provider组件]).
  // (B). div 会直接用 container.append(el) 添加到根节点 div#app, 而在此之前会处理子节点：
  // (C). 对于 p 标签直接挂载；对于 Provider 组件，会再次走组件的初始化逻辑，包括 Provider 的 instance 的初始化逻辑，其中的 parent 就被赋值为 App 组件的 Instance。再往后就会走到这里：
  // (D). 再次回到这里的时候，Instance 就是 Provider 组件，而 subTree 就是 Provider 组件内的 render 执行返回的节点: h("div",{},[p标签, Consumer组件]) 
  // ... 以此类推

  // patch 是个拆箱的过程
  // 在 createApp 中，通过根组件生成vnode > 调用 render >  调用 patch 拆箱：判断vnode类型（component类型或者element类型）
  // 如果是 component 类型: 递归调用 patch 拆箱，直到遇到 element 类型的 vnode
  //   过程中生成 instance、proxy 对象，将 proxy 对象作为 render 函数的 this 执行，
  //   这样外部就能获取到 proxy 对象代理的 setupResult 中的值以及 $el 等 API
  // 如果是 element 类型: 调用 mountElement > 生成真正的DOM节点挂载到上层容器,
  //   mountElement 还会将真正的DOM节点引用 el 挂载到对应的element类型的 vnode 上,
  //   对应上面的代码，最终subTree上会有一个el属性，存放真正的DOM节点引用

  //// patch 执行完毕后，subTree上面挂载 el，存储真正的DOM节点引用。
  // 外部 vue 单文件组件控制的实际上是根组件。
  // 所以接下来要将 subTree.el 赋值给与之对应的根组件。
  initialVNode.el = subTree.el // instance.vnode.el = subTree.el
}
