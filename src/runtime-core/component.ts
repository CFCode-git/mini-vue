import { initProps } from './componentProps'
import { PublicInstanceProxyHandler } from './componentPublicInstance'
import { shallowReadonly } from '../reactivity/reactivity'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent
  }
  // 通过bind产生一个新函数，指定新函数的 this 为 null，第一个参数为 component，也即 instance 实例对象
  // 在 emit 函数内部需要从 instance 实例对象中取出 props 中的 emit 函数
  component.emit = emit.bind(null, component) as any
  return component
}

export function setupComponent(instance) {
  // 将 props 从虚拟节点中取出挂载到 instance
  initProps(instance, instance.vnode.props)
  // 初始化 slots
  initSlots(instance, instance.vnode.children)

  // 处理有状态的组件（非函数组件）
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  // proxy 模式，创建 context 代理 setupState、$el 等
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler)

  const { setup } = Component

  if (setup) {
    // 在 setup 调用前将全局的 currentInstance 赋值为当前的 instance
    setCurrentInstance(instance)
    // 将 props 作为参数传递给 setup 函数
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    handleSetupResult(instance, setupResult)
  }
  // 在 setup 调用完毕后，将全局的 currentInstance 置为 null
  setCurrentInstance(null)
}

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}

// getCurrentInstance 只能在 setup 函数中调用
let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}

// 通过函数封装赋值操作，好处是作为一个中间层，后续在我们想跟踪 currentInstance 的赋值操作时，可以直接在这里打断点进行调试。
function setCurrentInstance(instance) {
  currentInstance = instance
}
