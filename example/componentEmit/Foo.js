import { h } from '../../lib/mini-vue.esm.js'

export const Foo = {
  // 从 setup 第二个参数中拿到 emit 函数, setup 第二个参数是一个对象.
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log('Foo组件,emitAdd函数')
      emit('add',1,2,3)
    }
    const emitAddFoo = () => {
      console.log('Foo组件,emitAddFoo函数')
      emit('add-foo','我是Foo组件的emitAddFoo')
    }
    return {
      emitAdd,
      emitAddFoo
    }
  },
  render() {
    const addBtn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'addBtn'
    )
    const addFooBtn = h(
      'button',
      {
        onClick: this.emitAddFoo
      },
      'addFooBtn'
    )

    const foo = h(
      'p',
      {
        class: ['fooComponent']
      },
      'this is foo component, props: ' + this.count
    )

    return h('div', {}, [foo, addBtn, addFooBtn])
  }
}
