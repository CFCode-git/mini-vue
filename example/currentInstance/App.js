import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  name: 'App',
  render() {
    window.self = this
    return h('div', { id: 'root' }, [h('p', {}, 'getCurrentInstance demo'), h(Foo)])
  },
  setup() {
    const instance = getCurrentInstance()
    console.log('App: ', instance)
  }
}
