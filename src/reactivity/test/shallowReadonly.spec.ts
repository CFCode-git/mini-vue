import { isReadonly, shallowReadonly } from '../reactivity'

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    // shallowReadonly 只有最外部的表层是readonly proxy，内部是普通对象
    // 一般用于优化，当业务场景中不需要对所有的嵌套对象转化为 proxy 的时候使用。
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })
  it('should call console.warn when set', () => {
    console.warn = jest.fn()
    let original = { age: 1 }
    let observed = shallowReadonly(original)
    observed.age = 2
    expect(console.warn).toHaveBeenCalled()
  })
})
