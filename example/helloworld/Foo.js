import { h } from '../../lib/mini-vue.esm.js'

export const Foo = {
  setup(props) {
    // props: {count:1}
    // 功能点1. 在 setup 中访问 props
    console.log(props)

    // 功能点3. props 是 shallowReadonly
    props.count++
    console.log(props)
  },
  render() {
    // 功能点2. 在 render 中通过 this 访问 props 中的属性
    return h(
      'div',
      {},
      'Foo:' + this.count
    )
  }
}
