import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  name: 'App',
  render() {
    window.self = this
    return h('div', { id: 'root' }, [
      h('div', {}, this.msg),
      h(Foo, {
        count: 1,
        onAdd: (...args) => {
          console.log('App组件中的Foo, onAdd执行,父组件App中监听到子组件Foo emit 的 add event,传来的参数是: ', ...args)
        },
        onAddFoo(...args){
          console.log('App组件, onAddFoo执行, 传来的参数是: ', ...args)
        }
      })
    ])
  },
  setup() {
    return {
      msg: 'App Component'
    }
  }
}
