import { isReactive, reactive } from "../reactivity"

describe('reactivity', () => {
  it('happy path', () => {
    let original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
  })
})