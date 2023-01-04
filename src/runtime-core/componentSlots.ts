export function initSlots(instance, children) {
  normalizeObject(children, instance.slots)
}

function normalizeObject(children: any, slots: any) {
  for (const key in children) {
    const slot = children[key]
    // 这里 slots[key] 返回的函数 最终会在 renderSlots 内部被调用， slots[key] 最终的值会是一个 vnode 数组 : [h('p',{},arg),...] 
    slots[key] = arg => normalizeSlotValue(slot(arg))
  }
}

// 兜底，对于单节点用数组包裹
function normalizeSlotValue(slot) {
  return Array.isArray(slot) ? slot : [slot]
}
