import { readonly } from "../reactivity"

describe('readonly', () => {
  it('happy path', () => {
    let original = { age: 1 }
    let observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.age).toBe(1)
  })
  it('warn when call setter', () => {
    console.warn = jest.fn()
    let original = { age: 1 }
    let observed = readonly(original)
    observed.age = 2
    expect(console.warn).toHaveBeenCalled()
  });
})
