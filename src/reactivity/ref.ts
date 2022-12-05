import { trackEffect, triggerEffect, isTracking } from './effect'
import { isObject } from '../shared/index'
import { reactive } from './reactivity'

class RefImpl {
  private _value: any
  private deps
  private _rawValue
  public __v_isRef = true

  constructor(value) {
    this._rawValue = value
    this._value = isObject(value) ? reactive(value) : value
    this.deps = new Set()
  }

  get value() {
    // 收集依赖
    if (isTracking()) {
      trackEffect(this.deps)
    }
    return this._value
  }
  set value(newValue) {
    // 只有值变化的时候才触发依赖
    if (!Object.is(newValue, this._rawValue)) {
      this._value = isObject(newValue) ? reactive(newValue) : newValue
      this._rawValue = newValue
      // 触发依赖
      triggerEffect(this.deps)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objWithRef) {
  return new Proxy(objWithRef, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        // target[key].value 修改原对象的值，触发 ReefImpl setter
        return (target[key].value = value)
      } else {
        // 直接替换
        return Reflect.set(target, key, value)
      }
    }
  })
}
