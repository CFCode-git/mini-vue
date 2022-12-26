export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }
  return component
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlot()

  // 处理有状态的组件（非函数组件）
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  // proxy 模式，创建 context 代理 setupState、$el 等
  instance.proxy = new Proxy(
    {},
    {
      get(target, key) {
        // 从 setupState 中获取
        const { setupState } = instance
        if (key in setupState) {
          return setupState[key]
        }

        // $options ...

      }
    }
  )

  const { setup } = Component

  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
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
