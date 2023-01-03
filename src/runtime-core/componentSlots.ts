export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]

  // 兜底，对于单节点用数组包裹
  let slots = {}
  for (const key in children) {
    const slot = children[key]
    slots[key] = Array.isArray(slot) ? slot : [slot]
  }
  instance.slots = slots
}
