import { ReactiveEffect } from './effect'
class computedImpl {
  private _value: any
  private _dirty: boolean = true
  private _effect: ReactiveEffect
  constructor(getter) {
    // 当 getter 里面的依赖项发生变化, 触发 trigger > 执行 scheduler
    this._effect = new ReactiveEffect(getter, () => {
      // 通过 scheduler 将 _dirty 置为 true, 即将缓存放开, 再下一次调用 computedImpl.value 的时候重新执行 _effect.run > 执行 getter > 更新 _value 的值
      if(!this._dirty){
        this._dirty = true
      }
    })
  }
  get value() {
    // 通过 this._dirty 缓存 getter 的结果，
    // 再次调用 computedImpl.value 的时候直接拿缓存的值
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new computedImpl(getter)
}
