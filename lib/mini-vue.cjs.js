'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
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
    const el = document.createElement(vnode.type);
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
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render(); // 得到App.js中h函数生成的虚拟节点
    // vnode > patch
    // vnode > element > mountElement
    patch(subTree, container);
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

exports.createApp = createApp;
exports.h = h;
