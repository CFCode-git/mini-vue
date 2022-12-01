import { effect } from '../effect'
import { ref } from '../ref'

describe('ref', () => {
  it.only('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })
  it('should be reactive', () => {
    const a = ref(1)
    let calls = 0
    let dummy
    effect(() => {
      calls++
      dummy = a.value
    })

    expect(dummy).toBe(1)
    expect(calls).tobe(1)

    a.value = 2
    expect(dummy).toBe(2)
    expect(calls).tobe(2)

    // same value should not trigger
    // a.value = 2
    // expect(calls).tobe(2)
    // expect(calls).tobe(2)
  })

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })

    expect(dummy).toBe(1)

    a.value.count = 2
    expect(dummy).toBe(2)
  })
})
