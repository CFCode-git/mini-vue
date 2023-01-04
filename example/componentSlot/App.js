import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  name: 'App',
  render() {
    window.self = this

    const app = h('div', {}, this.msg)
    // 单个节点
    // const foo = h(Foo, { count: 1 }, h('p', {}, 'slots'))
    // 节点数组
    // const foo = h(Foo, { count: 1 }, [h('p', {}, 'slots1'),h('p', {}, 'slots2')])

    // 具名插槽
    // const foo = h(Foo, { count: 1 }, {
    //   header: h('p', {}, 'slots1'),
    //   footer: h('p', {}, 'slots2')
    // })

    // 作用域插槽
    const foo = h(Foo, { count: 1 }, {
      header: ({arg}) => h('p', {}, 'slots1' + arg),
      footer: ({arg2:arg}) => h('p', {}, 'slots2' + arg)
    })

    return h('div', { id: 'root' }, [app, foo])
  },
  setup() {
    return {
      msg: 'this is App Component'
    }
  }
}
