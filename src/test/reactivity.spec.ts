import { reactive } from "../reactivity"

describe('reactivity', () => {
  it('happy path', () => {
    let original = { foo: 1 }
    const observed = reactive(original)

    expect(observed).not.toBe(original)

    expect(observed.foo).toBe(1)
  })
})