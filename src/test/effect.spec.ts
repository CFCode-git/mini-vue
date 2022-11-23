import { effect } from '../effect'
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
})
