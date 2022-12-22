import { h } from '../../lib/mini-vue.esm.js'
export const App = {
  // .vue 单文件组件
  // <template></template> >> render 函数
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['hello', 'world']
      },
      //  'hi, ' + this.msg
      [
        h(
          'p',
          {
            class: 'red'
          },
          'hello'
        ),
        h(
          'p',
          {
            class: 'blue'
          },
          'world'
        )
      ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}
