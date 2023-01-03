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
    const foo = h(Foo, { count: 1 }, [h('p', {}, 'slots1'),h('p', {}, 'slots2')])

    return h('div', { id: 'root' }, [app, foo])
  },
  setup() {
    return {
      msg: 'this is App Component'
    }
  }
}
