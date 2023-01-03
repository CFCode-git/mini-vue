'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function initProps(instance, rawProps) {
    // 兜底, 根组件 App 没有 props
    instance.props = rawProps || {};
    // 处理 $attrs
}

const extend = Object.assign;
const isObject = val => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);
// 首字母大写
const capitalize = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// event > onEvent
const toHandlerKey = event => {
    return event ? 'on' + capitalize(event) : '';
};
// 烤肉串命名方式支持 add-foo > addFoo
const camelize = (str) => {
    // _ 是匹配 -(/w) 的字符串，c是(\w)中括号提取出来的字符串
    return str.replace(/-(\w)/g, (_, c) => {
        // console.log('_:',_,'c:',c);
        return c ? c.toUpperCase() : '';
    });
};

const publicPropertiesMap = {
    $el: instance => instance.vnode.el,
    $slots: instance => instance.slots
};
const PublicInstanceProxyHandler = {
    get({ _: instance }, key) {
        // 从 setupState 中获取
        const { setupState, props } = instance;
        /*
        if (key in setupState) {
          return setupState[key]
        }
        */
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        // 处理 $el
        if (publicGetter) {
            return publicGetter(instance);
        }
        // $data > options API
        // 处理 $options ...
    }
};

const targetMap = new Map();
function trigger(target, key) {
    // 触发依赖
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 这里是为了复用 getter 函数，而不需要每次创建 proxy 的时候都创建一个新的 getter
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 默认：不是 readOnly, 不是 shallow : get() 可以获取值，并且做依赖收集
// 是 readOnly, 不是 shallow : get() 可以获取值，不做依赖收集，同时递归下去，对象深层同样可以获取值，但是不做依赖收集
// 是 readOnly, 是 shallow : get() 同样获取值，不做依赖收集。
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // 处理 isReadonly 和 isReactive 的调用
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        let res = Reflect.get(target, key);
        // 如果是 shallow 直接返回结果
        if (shallow) {
            return res;
        }
        // 如果是shallow, 不需要递归对嵌套对象执行,深层的对象不做proxy代理了。
        // 如果不是shallow, 且返回的结果仍然是一个对象，根据是否 readOnly 对这个深层的对象继续做处理
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        let res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target);
        return true;
    }
};
// 通过 extends(Object.assign) 改写 readonlyHandlers 的 getter 方法
// shallow 的第一层是 readonly, 但第二层往后的嵌套对象是普通对象, 普通对象不走 proxy 代理
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return;
    }
    return new Proxy(target, baseHandlers);
}

// emit 函数会挂载到 instance 中，最终作为 setup 第二个参数对象的一部分传给用户调用
// 用户调用的时候可以传 eventName,第一个参数 instance 由初始化的时候自动绑定，用户不需要传。
function emit(instance, event, ...args) {
    console.log('componentEmit函数');
    const { props } = instance;
    // console.log(instance, props)
    const handlerKey = toHandlerKey(camelize(event));
    const handler = props[handlerKey];
    handler && handler(...args);
}

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children]
    // 兜底，对于单节点用数组包裹
    let slots = {};
    for (const key in children) {
        const slot = children[key];
        slots[key] = Array.isArray(slot) ? slot : [slot];
    }
    instance.slots = slots;
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {}
    };
    // 通过bind产生一个新函数，指定新函数的 this 为 null，第一个参数为 component，也即 instance 实例对象
    // 在 emit 函数内部需要从 instance 实例对象中取出 props 中的 emit 函数
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 将 props 从虚拟节点中取出挂载到 instance
    initProps(instance, instance.vnode.props);
    // 初始化 slots
    initSlots(instance, instance.vnode.children);
    // 处理有状态的组件（非函数组件）
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // proxy 模式，创建 context 代理 setupState、$el 等
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        // 将 props 作为参数传递给 setup 函数
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
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

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断 vnode 类型
    // 判断是不是 element
    // if (typeof vnode.type === 'string') {
    //   // 处理 element
    //   processElement(vnode, container)
    // } else if (isObject(vnode.type)) {
    //   // 处理组件
    //   processComponent(vnode, container)
    // }
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        // 处理 element
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
    const { children, shapeFlag } = vnode;
    /*
      if (typeof children === 'string') {
        el.textContent = children
      } else if (Array.isArray(children)) {
        mountChildren(children, el)
      }
    */
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        // 通过 与运算 查找判断 xxxx & 0100 得到  0100【十进值 4】或者 0000【十进值 0】
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        let val = props[key];
        // 约定事件绑定规范：判断是否以 on 开头
        const isOn = key => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            // onClick => 'click'
            el.addEventListener(key.slice(2).toLowerCase(), val);
        }
        else {
            el.setAttribute(key, val);
        }
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
    vnode.el = subTree.el; // instance.vnode.el = subTree.el
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
        children,
        shapeFlag: getShapeFlag(type)
    };
    // 判断 children 类型，修改 shapeFlag
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */; // 01xx, xx = 01 或者 10
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */; // 10xx, xx = 01 或者 10
    }
    return vnode;
}
// 初始化 vnode 的 shapeFlag
function getShapeFlag(type) {
    return typeof type === 'string' ?
        1 /* ShapeFlags.ELEMENT */ : // 0001 > 1
        2 /* ShapeFlags.STATEFUL_COMPONENT */; // 0010 > 2
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

function renderSlots(slots, name) {
    return createVNode('div', {}, slots[name]);
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;
