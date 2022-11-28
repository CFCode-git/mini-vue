import { isProxy, isReadonly, readonly } from '../reactivity'

describe('readonly', () => {
  it('should make nested values readonly', () => {
    let original = { foo: 1, bar: { baz: 2 } }
    let wrapper = readonly(original)
    expect(wrapper).not.toBe(original)
    expect(wrapper.foo).toBe(1)

    expect(isReadonly(wrapper)).toBe(true)
    expect(isReadonly(original)).toBe(false)

    expect(isReadonly(wrapper.bar)).toBe(true)
    expect(isReadonly(original.bar)).toBe(false)

    expect(isProxy(wrapper)).toBe(true)
  })
  it('should call console.warn when set', () => {
    console.warn = jest.fn()
    let original = { age: 1 }
    let observed = readonly(original)
    observed.age = 2
    expect(console.warn).toHaveBeenCalled()
  })
})
