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
    console.log(this.$slots)
    // Foo.vnode.children
    return h('div', {}, [renderSlots(this.$slots, 'header'), foo, renderSlots(this.$slots, 'footer')])
  }
}
