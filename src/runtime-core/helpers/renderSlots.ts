import { createVNode } from '../vnode'
export function renderSlots(slots, name, arg) {

  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return createVNode('div', {}, slot(arg)) // 调用得到slot节点
    }
  }

}
