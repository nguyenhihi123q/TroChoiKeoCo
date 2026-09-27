// Sinh ID ổn định, không phụ thuộc thư viện ngoài.

let counter = 0;

/** ID ngắn, đủ duy nhất cho dữ liệu phía trình duyệt. */
export function uid(prefix = ''): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}${time}-${rand}-${counter.toString(36)}`;
}
