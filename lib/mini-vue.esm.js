function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlot()
    // 处理有状态的组件（非函数组件）
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // proxy 模式，创建 context 代理 setupState、$el 等
    instance.proxy = new Proxy({}, {
        get(target, key) {
            // 从 setupState 中获取
            const { setupState } = instance;
            if (key in setupState) {
                return setupState[key];
            }
            // 处理 $el
            if (key === '$el') {
                return instance.vnode.el;
            }
            // 处理 $options ...
        }
    });
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断 vnode 类型
    // 判断是不是 element
    if (typeof vnode.type === 'string') {
        // 处理 element
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    // children
    const { children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    container.append(el);
}
function mountChildren(children, el) {
    for (const child of children) {
        patch(child, el);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 通过虚拟节点 vnode 创建组件实例对象 instance
    // 以便挂载 props slots 等组件相关的属性
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    // 将 proxy 对象作为 render 函数的 this >>> render 函数内访问 this.msg / this.$el / ....
    const subTree = instance.render.call(proxy); // 得到App.js中h函数生成的虚拟节点
    // vnode > patch
    // vnode > element > mountElement
    patch(subTree, container);
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
    // instance.vnode.el = subTree.el 
    vnode.el = subTree.el;
}

/**
 *
 * @param type 组件对象
 * @param props
 * @param children
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

/**
 *
 * @param rootComponent 根组件
 * @returns
 */
function createApp(rootComponent) {
    return {
        /**
         *
         * @param rootContainer 根容器
         */
        mount(rootContainer) {
            // 先转换成虚拟节点 vnode
            // 后续所有的逻辑操作都基于 vnode 进行处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
