import { h } from '../../lib/mini-vue.esm.js'

window.self = null
export const App = {
  // .vue 单文件组件
  // <template></template> >> render 函数
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['hello', 'world'],
        onClick(){
          console.log('click');
        },
        onMouseDown(){
          console.log('mousedown');
        }
      },
      'hi, ' + this.msg
      // [
      //   h(
      //     'p',
      //     {
      //       class: 'red'
      //     },
      //     'hello'
      //   ),
      //   h(
      //     'p',
      //     {
      //       class: 'blue'
      //     },
      //     'world'
      //   )
      // ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue, good'
    }
  }
}
