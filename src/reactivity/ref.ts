import { trackEffect, triggerEffect, isTracking } from './effect'
import { isObject } from '../shared/index'
import { reactive } from './reactivity'

class RefImpl {
  private _value: any
  private deps
  private _rawValue

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
