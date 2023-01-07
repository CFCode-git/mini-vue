import { h, provide, inject } from '../../lib/mini-vue.esm.js'

window.self = null
export const App = {
  name: 'App',
  setup() {
    return {}
  },
  render() {
    window.self = this
    return h('div', {}, [h('p', {}, 'apiInject DEMO'), h(Provider)])
  }
}

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', "provider's foo")
    provide('bar', "provider's bar")
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    return {
      foo,
      bar
    }
  },
  render() {
    return h('div', {}, `Consumer - ${this.foo} - ${this.bar}`)
  }
}
