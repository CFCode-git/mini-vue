/**
 *
 * @param type 组件对象
 * @param props
 * @param children
 */
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children
  }
  return vnode
}
