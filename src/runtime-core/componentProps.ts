export function initProps(instance, rawProps) {
  // 兜底, 根组件 App 没有 props
  instance.props = rawProps || {}

  // 处理 $attrs
}
