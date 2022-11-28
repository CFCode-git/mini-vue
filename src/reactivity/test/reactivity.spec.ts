import { isProxy, isReactive, reactive } from '../reactivity'

describe('reactivity', () => {
  it('happy path', () => {
    let original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)

    expect(isProxy(observed)).toBe(true)
  })
  test('nested reactive', () => {
    // 嵌套 reactive
    let original = {
      nested: { foo: 18 },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original);

    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})
