import { h } from '../../lib/mini-vue.esm.js'
export const App = {
  // .vue 单文件组件
  // <template></template> >> render 函数
  render() {
    return h('div', 'hi, ' + this.msg)
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}
