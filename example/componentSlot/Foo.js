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

    // 取出 slots > Foo.vnode.children
    // 子组件中调用 renderSlots 创建新的节点, 渲染 slots

    // 作用域插槽:
    // 将 Foo 组件中的变量作为 renderSlots 的参数传入, 
    // 在作用域插槽中, this.$slots 里面的每一个 slot 都是一个函数:(arg) => h() 
    // 该函数会在 renderSlots 内部被调用生成需要的 slot 节点，同时传入 args 参数
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { arg:arg1 }),
      foo,
      renderSlots(this.$slots, 'footer', { arg:arg2 })
    ])
  }
}
