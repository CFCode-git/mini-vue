'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
    // 判断 children 是否 slots 对象 : 组件对象 + typeof children === 'object'
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextNode(text) {
    return createVNode(Text, {}, text);
}
// 初始化 vnode 的 shapeFlag
function getShapeFlag(type) {
    return typeof type === 'string' ?
        1 /* ShapeFlags.ELEMENT */ : // 0001 > 1
        2 /* ShapeFlags.STATEFUL_COMPONENT */; // 0010 > 2
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, arg) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(arg)); // 调用得到slot节点数组
        }
    }
}

function initProps(instance, rawProps) {
    // 兜底, 根组件 App 没有 props
    instance.props = rawProps || {};
    // 处理 $attrs
}

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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            // 当 this.active = false，说明当前 Effect 已经被标记为 stop，不应该被收集依赖
            return this._fn();
        }
        // this.active = true，收集依赖
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn(); // 执行fn > 触发 getter > 触发 track > 收集依赖
        // reset，依赖收集完毕后重置状态
        shouldTrack = false;
        return result;
    }
    stop() {
        // 清除掉 dep 依赖集合中的当前 effect 实例
        // 达到 trigger 触发依赖的时候不执行当前的 _fn 的效果。
        if (this.active) {
            cleanUpEffect(this);
            if (this.onStop)
                this.onStop();
            this.active = false;
        }
    }
}
function cleanUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    // effect.deps 的作用只是为了通过引用的方式从dep中删除当前effect
    // 当删除完毕后 deps 就没有用了，可以清空
    effect.deps.length = 0;
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    // Object.assign(_effect, options)
    // _effect.onStop = options.onStop
    _effect.run();
    // 这里将当前 effect 的 run 方法返回出去，同时挂载了当前 effect 实例，在后续执行 stop 方法的时候用到.
    let runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // 依赖收集 target => key => dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    // 如果这个activeEffect已经被收集过了，那么下面两个就不需要执行了，特别是对于 activeEffect.deps 不需要重复收集
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    // activeEffect 只有在调用了 effect() 以后才有值，
    // 而单纯的 getter 也会触发 track 函数，因此这里需要判断一下
    // if (!activeEffect) return
    // 「情况一」如果 effect 被 stop，那么 shouldTrack 无法被置为 true，也就无法收集依赖
    // 「情况二」第二次触发 getter > trigger 的时候，有可能上一次收集依赖的 activeEffect 还没有被清除，
    //         此时也不应该收集依赖
    // shouldTrack 全局变量保证了 effect.run() 是收集依赖的安全性，
    // 只有执行 run 方法，将 shouldTrack 置为 true 才能收集依赖
    // if(!shouldTrack)return
    // 如果下面的条件成立，那么可以认为当前执行到这里的effect是正在收集的状态(可以被收集)
    return shouldTrack && activeEffect !== undefined;
}
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
        // 依赖收集, 如果是readonly, 不需要收集依赖
        if (!isReadonly)
            track(target, key);
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
    // 判断是否需要做 slots 的处理工作
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObject(children, instance.slots);
    }
}
function normalizeObject(children, slots) {
    for (const key in children) {
        const slot = children[key];
        // 这里 slots[key] 返回的函数 最终会在 renderSlots 内部被调用， slots[key] 最终的值会是一个 vnode 数组 : [h('p',{},arg),...] 
        slots[key] = arg => normalizeSlotValue(slot(arg));
    }
}
// 兜底，对于单节点用数组包裹
function normalizeSlotValue(slot) {
    return Array.isArray(slot) ? slot : [slot];
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = isObject(value) ? reactive(value) : value;
        this.deps = new Set();
    }
    get value() {
        // 收集依赖
        if (isTracking()) {
            trackEffect(this.deps);
        }
        return this._value;
    }
    set value(newValue) {
        // 只有值变化的时候才触发依赖
        if (!Object.is(newValue, this._rawValue)) {
            this._value = isObject(newValue) ? reactive(newValue) : newValue;
            this._rawValue = newValue;
            // 触发依赖
            triggerEffect(this.deps);
        }
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objWithRef) {
    return new Proxy(objWithRef, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                // target[key].value 修改原对象的值，触发 ReefImpl setter
                return (target[key].value = value);
            }
            else {
                // 直接替换
                return Reflect.set(target, key, value);
            }
        }
    });
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {}
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
        // 在 setup 调用前将全局的 currentInstance 赋值为当前的 instance
        setCurrentInstance(instance);
        // 将 props 作为参数传递给 setup 函数
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
    // 在 setup 调用完毕后，将全局的 currentInstance 置为 null
    setCurrentInstance(null);
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
// getCurrentInstance 只能在 setup 函数中调用
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
// 通过函数封装赋值操作，好处是作为一个中间层，后续在我们想跟踪 currentInstance 的赋值操作时，可以直接在这里打断点进行调试。
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    // getCurrentInstance 只能在 setup 函数中使用，provide 和 inject 两个函数也要在 setup 中使用
    // 这里要判断一下是否存在
    if (currentInstance) {
        let { provides } = currentInstance;
        let parent = currentInstance.parent;
        // 如果组件调用了 provide, 那么就改写组件的 provides，将它的 provides 的原型指向父级的 provides;
        // 如果没有调用，那么直接使用来自父级的 provides 引用即可
        // 还要注意的一个问题是，这里的改写操作应该只有在该组件第一次调用 provide 的时候，也就是 init 的时候执行, 否则在第二次执行 provides 的时候会重新得到一个空对象， 丢失了第一次执行的赋值.
        // 判断依据是当前组件的 provides 和父级的 provides 相等，因为在初始化 Instance 的时候将父级的 provides 的引用传给了当前 Instance.
        // 如果两者相等 说明还没执行下面的 init 操作。
        if (provides === parent.provides) {
            provides = currentInstance.provides = Object.create(parent.provides); // Object.create(proto) 创建一个新对象，并且指定原型为 proto, 执行完毕后相当于会得到一个指定 proto 的空对象.
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides[key]) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// render 存在于 createRenderer 中
function createAppAPI(render) {
    /**
     *
     * @param rootComponent 根组件
     * @returns
     */
    return function createApp(rootComponent) {
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
    };
}

function createRenderer(options) {
    const { createElement, patchProp, insert } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    // n1 >> old vnode
    // n2 >> new vnode
    function patch(n1, n2, container, parentComponent) {
        const { shapeFlag, type } = n2;
        switch (type) {
            // 处理 Fragment 比如 slots
            case Fragment:
                // 如果 type 不是 div / p 等标签节点而是 Fragment，那么只需要 mount vnode.children
                processFragment(n1, n2, container, parentComponent);
                break;
            // 处理文本节点, children: string
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // 判断 vnode 类型
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理 element
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    // slots 走 mountFragment 逻辑 只 mountChildren, 此时的 vnode 就是 slots 数组
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log('old -- n1', n1);
        console.log('new -- n2', n2);
    }
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = createElement(vnode.type));
        // children
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 通过 与运算 查找判断 xxxx & 0100 得到  0100【十进值 4】或者 0000【十进值 0】
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            let val = props[key];
            patchProp(el, key, val);
        }
        insert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parentComponent);
        });
        // for (const child of children) {
        //   patch(child, container)
        // }
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        // 通过虚拟节点 vnode 创建组件实例对象 instance
        // 以便挂载 props slots 等组件相关的属性
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        const { proxy } = instance;
        // 在这个函数内调用 render 生成虚拟节点 subTree
        effect(() => {
            if (!instance.isMounted) {
                // init
                // 将 proxy 对象作为 render 函数的 this >>> render 函数内访问 this.msg / this.$el / ....
                const subTree = (instance.subTree = instance.render.call(proxy)); // 得到App.js中h函数生成的虚拟节点
                // 只有组件类型的 vnode 才会走到这里。
                // subTree 是当前 component 的 instance 执行 render 后返回的 vnode 节点, 比如
                //   h("div",{},[child1,child2]) 节点本身是 element 类型，会直接挂载到上一级container中
                // 而在挂载前，根据 child1 和 child2 的类型又会用 patch 处理，同时 instance 也会向下传递.
                // 将 subTree 扔给 patch，会对内部的节点根据类型(element/component/..)再次处理
                patch(null, subTree, container, instance); // 这里的 parentComponent 是 instance 要仔细理解
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
                initialVNode.el = subTree.el; // instance.vnode.el = subTree.el
                instance.isMounted = true;
            }
            else {
                //update
                const prevSubTree = instance.subTree; // 旧的虚拟节点
                const subTree = instance.render.call(proxy); // 生成新的虚拟节点
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        // 通过参数方式向 createApp 传入 render 处理函数
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
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
function insert(el, parent) {
    parent.append(el);
}
// {createApp: createAppAPI(render)}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextNode = createTextNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
