import { effect } from '../effect'
import { reactive } from '../reactivity'
import { isRef, proxyRefs, ref, unRef } from '../ref'

describe('ref', () => {
  it('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })
  it('should be reactive', () => {
    const a = ref(1)
    let calls = 0
    let dummy
    effect(() => {
      calls++
      dummy = a.value
    })

    expect(dummy).toBe(1)
    expect(calls).toBe(1)

    a.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)

    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(calls).toBe(2)
  })

  it('should make nested properties reactive', () => {
    // 这里返回的 a 是 一个 {value: Proxy} 对象，其中的 Proxy target 是 {count: 1}
    const a = ref({ count: 1 })
    let dummy
    effect(() => {
      dummy = a.value.count
    })

    expect(dummy).toBe(1)

    // 下面这种写法不会触发 refImpl 的 setter
    // a.value.count = 2 // 第一种方式
    // 当 ref 接受一个对象的时候，会直接返回一个被包裹的 reactive Proxy
    // a.value 触发 refImpl 的 getter，拿到 reactive Proxy，后面就是 reactive 的流程
    // 后续 a.value.count = 2 触发 Proxy 的 setter(或getter)
    // 从 targetMap > depsMap > dep 中取出依赖执行

    // 下面这种写法才会触发 refImpl 的 setter，
    a.value = { count: 2 } // 第二种方式
    // 这里直接改了 refImpl 的 _value 的值，传入一个新对象
    // 在初始化 refImpl 的时候存储了 原始对象 rawValue
    // 当对比发现两者不相同，此时会重新对传入的新对象进行 reactive 处理，
    // 同时将 rawValue 修改为传入的新对象.
    // 最后触发依赖

    // 当 refImpl 是一个对象的时候，effect 会在 refImpl.deps 和 targetMap[target][key] 分别存储一份，前者在第二种方式中触发，后者在第一种方式触发。

    expect(dummy).toBe(2)
  })

  it('isRef', () => {
    const a = ref(1)
    const b = ref({ foo: 2 })
    const c = reactive({
      foo: 3
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(b)).toBe(true)

    expect(isRef(1)).toBe(false)
    expect(isRef(c)).toBe(false)

    expect(isRef(b)).toBe(true)
  })
  it('unRef', () => {
    const a = ref(1)

    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })
  it('proxyRefs', () => {
    // 常用于 template, 在 vue3 中, template 可以直接使用 ref 的值，而不需要 .value
    const user = {
      age: ref(10),
      name: 'this is string!',
      number: ref(5)
    }

    const proxyUser = proxyRefs(user)

    // get
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)

    // set, Condition One: 修改原对象的值, 触发 RefImpl setter
    proxyUser.age = 100
    expect(proxyUser.age).toBe(100)
    expect(user.age.value).toBe(100)

    // set, Condition Two: 直接替换
    proxyUser.name = 'I know!'
    proxyUser.number = ref(50)
  })
})
