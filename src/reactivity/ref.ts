import { trackEffect, triggerEffect, isTracking } from './effect'
class RefImpl {
  private _value: any
  private deps
  constructor(value) {
    this._value = value
    this.deps = new Set()
  }
  get value() {
    if (isTracking()) {
      trackEffect(this.deps)
    }
    return this._value
  }
  set value(newValue) {
    if (!Object.is(newValue, this._value)) {
      this._value = newValue
      triggerEffect(this.deps)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}
