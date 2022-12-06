import { computed } from '../computed'
import { reactive } from '../reactivity'

describe('computed', () => {
  it('happy path', () => {
  // 类似 ref, 通过 .value 取值
   const user = reactive({
    age: 18
   })
   let age = computed(()=>{
    return user.age
   })

   expect(age.value).toBe(18)
  })

  it('lazy computed and cache', () => {
    // 懒执行
    const value = reactive({
      foo: 1
    })

    const getter = jest.fn(()=>{
      return value.foo
    })

    const cValue = computed(getter)

    // 懒执行, cValue没有使用，不执行
    expect(getter).not.toHaveBeenCalled()

    // // 当调用 cValue.value 的时候，执行 getter
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // // should not computed again
    // // cValue.value 再次调用时，使用缓存的值
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1) // 仍然只是被调用了一次

    // // should not computed until needed
    // // 依赖发生更新
    value.foo = 2 
    // 要实现这一步: 需要引入 ReactiveEffect, 初始化的时候先通过 run() 方法收集依赖, 
    // 借助 scheduler API 的功能, 在更新的时候, 不执行 run() 方法, 执行 scheduler 方法
    // 将 _dirty 锁解开, 在下一次使用 cValue.value 的时候, 再次执行 run() 方法.
    expect(getter).toHaveBeenCalledTimes(1) // 仍然只是被调用了一次

    // // now it should compute
    // // 再次调用 cValue.value, 才会重新执行 getter
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
