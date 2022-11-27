import { isReadonly, readonly } from "../reactivity"

describe('readonly', () => {
  it('happy path', () => {
    let original = { age: 1 }
    let wrapper = readonly(original)
    expect(wrapper).not.toBe(original)
    expect(wrapper.age).toBe(1)

    expect(isReadonly(wrapper)).toBe(true)
    expect(isReadonly(original)).toBe(false)
  })
  it('warn when call setter', () => {
    console.warn = jest.fn()
    let original = { age: 1 }
    let observed = readonly(original)
    observed.age = 2
    expect(console.warn).toHaveBeenCalled()
  });
})
