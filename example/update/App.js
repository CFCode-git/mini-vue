import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
  setup() {
    const count = ref(0)

    const onClick = () => {
      count.value++
    }
    return {
      onClick,
      count
    }
  },
  render() {
    return h('div', { id: 'root' }, [
      h('div', {}, 'count:' + this.count),
      h(
        'button',
        {
          onClick: this.onClick
        },
        'click'
      )
    ])
  }
}
