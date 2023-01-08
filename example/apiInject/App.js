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
    provide('foo', "Provider's foo")
    provide('bar', "Provider's bar")
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', "ProviderTwo's foo")
    const foo = inject('foo')
    return {foo}
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo - ${this.foo}`), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')

    // const baz = inject('baz','defaultValue')
    const baz = inject('baz',()=>'defaultValue2')

    return {
      foo,
      bar,
      baz
    }
  },
  render() {
    return h('div', {}, `Consumer - ${this.foo} - ${this.bar} - ${this.baz}`)
  }
}
