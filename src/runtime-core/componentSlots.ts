export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]

  // 兜底，对于单节点用数组包裹
  let slots = {}
  for (const key in children) {
    const slot = children[key]
    // 这里 slots[key] 返回的函数 最终会被 renderSlots
    slots[key] = (arg) => normalizeSlot(slot(arg))
  }
  instance.slots = slots
}


function normalizeSlot(slot){
  return Array.isArray(slot) ? slot : [slot]
}
