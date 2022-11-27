import { extend } from "./shared"

class ReactiveEffect {
  deps = []
  onStop?: () => void
  active = true

  private _fn: any
  public scheduler: Function | undefined

  constructor(fn, scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    activeEffect = this
    return this._fn()
  }
  stop() {
    // 清除掉 dep 依赖集合中的当前 effect 实例
    // 达到trigger触发依赖的时候不执行当前的_fn的效果。
    if (this.active) {
      cleanUpEffect(this)
      if (this.onStop) this.onStop()
      this.active = false
    }
  }
}

function cleanUpEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

let activeEffect
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  extend(_effect, options)
  // Object.assign(_effect, options)
  // _effect.onStop = options.onStop

  _effect.run()
  // 这里将当前 effect 的 run 方法返回出去，同时挂载了当前 effect 实例
  // 在stop方法中，需要调用「传入的runner的effect上的stop」函数，它的效果是
  // 清除掉 dep 依赖Set集合中的当前 effect 实例
  // 使得后续的 trigger 不再触发该 effect 的 run 方法.
  let runner: any = _effect.run.bind(_effect)
  // 后面要在这个effect上拿stop方法执行
  runner.effect = _effect
  return runner
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

  // activeEffect 只有在调用了 effect() 以后才有值，
  // 而单纯的 getter 也会触发 track 函数，因此这里需要判断一下
  if (!activeEffect) return
  dep.add(activeEffect)

  // 这里不需要担心，因为每一个 effect 的调用对应一个 activeEffect 实例，不会造成重复收集，
  // 这里所有的 effectEffect 都存储了同一个 dep 的引用。
  // 为了stop api, 反向收集deps
  // 为了后续在 stop 中访问 dep 并移除对应的 effect
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  // 触发依赖
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function stop(runner) {
  // 调用runner上挂载的runner对应的effect实例上面的stop函数
  runner.effect.stop()
}
