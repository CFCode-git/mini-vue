import { ShapeFlags } from "../shared/ShapeFlags"

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
    children,
    shapeFlag: getShapeFlag(type)
  }

  // 判断 children 类型，修改 shapeFlag
  if(typeof children === 'string'){
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN // 01xx, xx = 01 或者 10
  }else if(Array.isArray(children)){
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN // 10xx, xx = 01 或者 10
  }

  return vnode
}

// 初始化 vnode 的 shapeFlag
function getShapeFlag(type) {
  return typeof type === 'string' ? 
    ShapeFlags.ELEMENT : // 0001 > 1
    ShapeFlags.STATEFUL_COMPONENT // 0010 > 2
}

