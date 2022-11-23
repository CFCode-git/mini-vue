class ReactiveEffect {
  private _fn: any

  constructor(fn) {
    this._fn = fn
  }

  run() {
    this._fn()
    currentEffect = this
  }
}

let currentEffect
export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

const targetMap = new Map()
export function track(target, key) {
  // 依赖收集 target => key => dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  if (currentEffect) {
    dep.add(currentEffect)
  }
}

export function trigger(target, key) {
  // 触发依赖
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    effect.run()
  }
}
