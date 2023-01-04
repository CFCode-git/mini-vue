import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js'

export const Foo = {
  // 从 setup 第二个参数中拿到 emit 函数, setup 第二个参数是一个对象.
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    console.log('Foo: ', instance)
  },
  render() {
    const foo = h('p', {}, 'foo component')

    return h('div', {}, [foo])
  }
}
