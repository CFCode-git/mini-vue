// 通过位运算提高效率

// | 或运算 -- 修改 (两位都为0，才是0)
// & 与运算 -- 查找 (两位都为1，才是1)

// 0000
// 0001
// ---- -- 通过或运算修改为：
// 0001

// 0101
// 0001
// ---- -- 通过与运算查找:
// 0001

export const enum ShapeFlags {
  ELEMENT = 1, // 1 > 补0：0001 > 十进值：1
  STATEFUL_COMPONENT = 1 << 1, // 1左移1位后：10 > 补0：0010 > 转化为十进值：2
  TEXT_CHILDREN = 1 << 2,      // 1左移2位后：100 > 补0：0100 > 转化为十进值：4
  ARRAY_CHILDREN = 1 << 3,     // 1左移3位后：1000 > 补0：1000 > 转化为十进值：2^3=8
  SLOT_CHILDREN = 1 << 4       // ...
}
