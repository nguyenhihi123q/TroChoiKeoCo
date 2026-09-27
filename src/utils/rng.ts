// Bộ sinh số ngẫu nhiên có hạt giống (seedable) để trộn câu hỏi/đáp án
// một cách xác định — phục vụ kiểm thử và tái lập trận đấu.

/** mulberry32: PRNG nhỏ gọn, xác định theo seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Trộn Fisher–Yates trên một bản sao, dùng hàm random cho trước. */
export function shuffle<T>(input: readonly T[], rand: () => number): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Tạo seed số từ chuỗi (ví dụ ID trận) để tái lập được. */
export function seedFromString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
