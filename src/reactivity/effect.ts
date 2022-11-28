import { extend } from '../shared'

let activeEffect
let shouldTrack
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

    if (!this.active) { 
      // 当 this.active = false，说明当前 Effect 已经被标记为 stop，不应该被收集依赖
      return this._fn()
    }

    // this.active = true，收集依赖
    shouldTrack = true
    activeEffect = this
    const result = this._fn() // 执行fn > 触发 getter > 触发 track > 收集依赖

    // reset，依赖收集完毕后重置状态
    shouldTrack = false

    return result
  }
  stop() {
    // 清除掉 dep 依赖集合中的当前 effect 实例
    // 达到 trigger 触发依赖的时候不执行当前的 _fn 的效果。
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
  // effect.deps 的作用只是为了通过引用的方式从dep中删除当前effect
  // 当删除完毕后 deps 就没有用了，可以清空
  effect.deps.length = 0 
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  extend(_effect, options)
  // Object.assign(_effect, options)
  // _effect.onStop = options.onStop

  _effect.run()
  // 这里将当前 effect 的 run 方法返回出去，同时挂载了当前 effect 实例，在后续执行 stop 方法的时候用到.
  let runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const targetMap = new Map()
export function track(target, key) {
  // activeEffect 只有在调用了 effect() 以后才有值，
  // 而单纯的 getter 也会触发 track 函数，因此这里需要判断一下
  if (!activeEffect) return
  // 「情况一」如果 effect 被 stop，那么 shouldTrack 无法被置为 true，也就无法收集依赖
  // 「情况二」第二次触发 getter > trigger 的时候，有可能上一次收集依赖的 activeEffect 还没有被清除，
  //         此时也不应该收集依赖
  // shouldTrack 全局变量保证了 effect.run() 是收集依赖的安全性，
  // 只有执行 run 方法，将 shouldTrack 置为 true 才能收集依赖
  if(!shouldTrack)return 

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

  dep.add(activeEffect)

  // 为了 stop api, 反向收集 dep
  // 为了后续在 stop 中访问 dep 并移除对应的 effect
  // 即便重复收集也问题不大，deps里面的 dep 属于同一个引用
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
