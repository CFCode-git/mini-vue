import { createVNode, Fragment } from '../vnode';
export function renderSlots(slots, name, arg) {

  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return createVNode(Fragment, {}, slot(arg)) // 调用得到slot节点数组
    }
  }

}
