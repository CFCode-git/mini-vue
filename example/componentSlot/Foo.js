import { h, renderSlots } from '../../lib/mini-vue.esm.js'

export const Foo = {
  setup(props) {},
  render() {
    const foo = h(
      'p',
      {
        class: ['fooComponent']
      },
      'this is foo component, props: ' + this.count
    )

    // 通过 this.$slots 取出在 App 组件中定义的 children
    // console.log(this.$slots)

    const arg1 = ' aaa'
    const arg2 = ' bbb'

    // Foo.vnode.children
    // 子组件中调用 renderSlots 创建新的节点, 渲染 slots
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { arg:arg1 }),
      foo,
      renderSlots(this.$slots, 'footer', { arg:arg2 })
    ])
  }
}
