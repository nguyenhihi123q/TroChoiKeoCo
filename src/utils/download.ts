// Tiện ích tải file về máy (không phụ thuộc thư viện nặng nào, để giữ bundle nhẹ).
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Tải một chuỗi văn bản (ví dụ JSON) về máy. */
export function downloadText(text: string, filename: string, mime = 'application/json'): void {
  triggerDownload(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}
