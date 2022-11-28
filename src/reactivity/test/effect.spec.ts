import { effect, stop } from '../effect'
import { reactive } from '../reactivity'

describe('effect', () => {
  it('happy path', () => {
    let user = reactive({
      age: 10
    })

    // init 一开始 effect 会执行一次
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    // update effect 再次执行
    user.age++
    expect(nextAge).toBe(12)
  })
  it('should return runner while effect was called', () => {
    // effect should return a runner
    // and we can get the result of the runner when we call runner
    let foo = 1
    const runner = effect(() => {
      foo++
      return 'runner called'
    })
    expect(foo).toBe(2)
    let res = runner()
    expect(foo).toBe(3)
    expect(res).toBe('runner called')
  })
  it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    // effect首次调用传入的fn
    expect(dummy).toBe(1)
    expect(scheduler).not.toHaveBeenCalled()

    // 传入 scheduler 之后当依赖更新, 不会出发 effect.run 的调用。
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)

    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
  it('stop', () => {
    let foo = reactive({ age: 1 })
    let dummy

    // 注意:
    // 每一次触发 foo.age setter > 触发 trigger 
    // > 执行 fn，设置activeEffect > 触发 foo.age getter > 重新收集依赖
    let runner = effect(() => {
      dummy = foo.age
    })

    foo.age = 2
    expect(dummy).toBe(2)

    stop(runner)
    // foo.age = 3
    foo.age++
    // foo.age++ 相当于 foo.age = foo.age+1
    // 会再调用一次getter
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })
  it('onStop', () => {
    let obj = reactive({
      age: 1
    })
    let dummy
    let onStop = jest.fn()
    let runner = effect(
      () => {
        dummy = obj.age
      },
      {
        onStop
      }
    )

    stop(runner)

    obj.age = 2
    expect(dummy).toBe(1)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
