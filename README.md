# Kéo co kiến thức 🎯

Trò chơi giáo dục trên trình duyệt dành cho học sinh THPT (Trường THPT Hai Bà Trưng, Huế) với chủ đề **lối sống xanh, ứng phó bão lũ và bảo vệ môi trường**. Hai đội thi đấu trực tiếp trên cùng một máy tính (giáo viên chiếu lên màn hình lớp học): trả lời đúng để kéo sợi dây về phía đội mình — đội kéo qua vạch mốc trước sẽ thắng.

Ứng dụng chạy hoàn toàn trong trình duyệt: **không cần tài khoản, không cần máy chủ, không cần kết nối mạng khi chơi**. Toàn bộ dữ liệu được lưu trong `localStorage` của máy.

## Yêu cầu môi trường

- **Node.js 18 trở lên** và **npm** (khuyến nghị Node 20 LTS).
- Không cần khóa API, biến môi trường hay bí mật nào — ứng dụng không gọi dịch vụ bên ngoài.

## Cài đặt & chạy

```bash
npm install       # cài phụ thuộc (bao gồm SheetJS/xlsx tải từ CDN chính chủ)
npm run dev       # chạy máy chủ phát triển, mở http://localhost:5173
npm run build     # kiểm tra kiểu (tsc) + đóng gói production vào thư mục dist/
npm run preview   # xem thử bản build production tại địa phương
npm run test      # chạy toàn bộ test (Vitest) một lần
npm run test:watch# chạy test ở chế độ theo dõi
npm run typecheck # chỉ kiểm tra kiểu TypeScript
```

## Triển khai lên Vercel

Repo đã kèm sẵn [vercel.json](vercel.json) (build bằng `npm run build`, xuất thư mục `dist`, có rewrite về `index.html`). Ứng dụng dùng **định tuyến hash** (`HashRouter`) nên hoạt động tốt kể cả khi mở trực tiếp file tĩnh.

**Cách 1 — Nhập từ giao diện Vercel:** Đưa mã nguồn lên một repo Git (GitHub/GitLab/Bitbucket) → vào Vercel → *Add New Project* → *Import* repo đó → Vercel tự nhận cấu hình từ `vercel.json` → *Deploy*.

**Cách 2 — Vercel CLI:**

```bash
npm i -g vercel
vercel          # triển khai bản xem trước
vercel --prod   # triển khai bản chính thức
```

> Lưu ý: kho mã này chưa được triển khai lên Vercel (bản dựng mới chỉ chạy và kiểm thử ở địa phương). Hãy tự thực hiện các bước trên để đưa trò chơi lên mạng.

## Cách chơi

1. **Thư viện trò chơi** (màn hình đầu): tạo trò chơi mới, hoặc chọn một trò đã lưu để Chơi / Sửa / Nhân bản / Xuất / Xóa. Lần mở đầu tiên có sẵn một trò chơi mẫu với bộ câu hỏi tiếng Việt.
2. **Tạo/Sửa**: đặt tên, tên hai đội, chọn chế độ chơi, thời lượng, mốc thắng, thời gian đóng băng khi trả lời sai, và soạn/nhập câu hỏi.
3. **Bảng luật** hiện ra trước mỗi trận để cả lớp cùng đọc; bấm **Bắt đầu** → đếm ngược 3-2-1 → thi đấu.
4. **Màn hình thi đấu** chia 3 cột: đội xanh 🔵 bên trái, khu vực giữa (dây kéo co + vạch mốc), đội đỏ 🔴 bên phải.
5. Kết thúc → **màn hình kết quả**: đội thắng, thống kê từng đội, và phần xem lại toàn bộ câu hỏi kèm đáp án đúng + giải thích.

### Điều khiển

Chơi được bằng **chuột, cảm ứng hoặc bàn phím**. Mỗi đội có 4 phím tương ứng 4 đáp án A/B/C/D:

| | Đáp án A | Đáp án B | Đáp án C | Đáp án D |
|---|---|---|---|---|
| 🔵 Đội xanh | `Q` | `W` | `A` | `S` |
| 🔴 Đội đỏ | `O` | `P` | `K` | `L` |

- **Phím cách (Space)**: tạm dừng / tiếp tục.
- Giáo viên còn có **bảng điều khiển**: tạm dừng, bỏ qua câu hỏi, chỉnh điểm ±, toàn màn hình, chơi lại, kết thúc sớm, thoát.
- Khi ẩn tab trình duyệt, trận đấu **tự động tạm dừng** để không mất thời gian.

## Ba chế độ chơi

- **Độc lập** (mặc định): mỗi đội có luồng câu hỏi riêng, trả lời theo tốc độ của mình. Đúng +1 và kéo dây về phía mình; sai bị đóng băng vài giây.
- **Cùng câu hỏi**: hai đội cùng nhận một câu hỏi trong mỗi lượt, thi xem ai trả lời đúng trước.
- **Chạm mốc**: đội nào đạt tới mốc điểm mục tiêu trước sẽ thắng ngay lập tức.

Khi hết giờ hoặc hết câu hỏi mà tỉ số hòa, trận đấu chuyển sang **loạt "cân não" (sudden death)** để phân định thắng thua.

## Nhập câu hỏi

Trong màn hình Sửa, mục "Nhập câu hỏi" có 3 nguồn:

1. **Kho mẫu**: chọn từ bộ câu hỏi tiếng Việt có sẵn (tích chọn từng câu hoặc chọn tất cả).
2. **Dán JSON**: dán một mảng câu hỏi dạng JSON, xem trước và báo lỗi theo từng câu.
3. **File Excel (.xlsx)**: bấm **Tải file mẫu** để lấy mẫu, điền rồi tải lên.

Định dạng cột của file Excel (dòng đầu là tiêu đề):

| Cột | Ý nghĩa |
|---|---|
| `question` | Nội dung câu hỏi |
| `optionA`–`optionD` | 4 phương án trả lời |
| `correctAnswer` | Đáp án đúng: `A`, `B`, `C` hoặc `D` |
| `explanation` | Giải thích (hiện ở màn hình kết quả) |
| `topic` | Chủ đề |

Mọi câu hỏi đều được kiểm tra và chuẩn hóa khi nhập; câu nào thiếu dữ liệu hoặc sai định dạng sẽ bị bỏ qua và liệt kê trong phần cảnh báo.

## Sao lưu & giới hạn dữ liệu

- Dữ liệu lưu trong **`localStorage` của trình duyệt trên máy đang dùng** — không đồng bộ giữa các máy hay các trình duyệt.
- Dùng **Xuất JSON** để sao lưu một trò chơi ra file, và **Nhập JSON** để khôi phục hoặc chuyển sang máy khác.
- `localStorage` thường giới hạn khoảng **5–10 MB** mỗi tên miền; đủ cho rất nhiều trò chơi và câu hỏi văn bản, nhưng không nên dán nội dung quá lớn.
- Xóa lịch sử/dữ liệu duyệt web hoặc dùng chế độ ẩn danh sẽ **mất dữ liệu đã lưu** — hãy Xuất JSON trước những thao tác đó.
- Nếu dữ liệu lưu bị hỏng, ứng dụng tự động sao lưu bản lỗi sang một khóa dự phòng và không xóa trắng dữ liệu của bạn.

## Ghi chú về nội dung & nguồn

- Các câu hỏi mẫu về phòng chống thiên tai được biên soạn theo hướng an toàn. **Luôn tuân thủ hướng dẫn của cơ quan chức năng địa phương**; nội dung trong trò chơi mang tính giáo dục, không thay thế chỉ dẫn chính thức.
- Lối sống xanh giúp **giảm nhẹ rủi ro và bảo vệ môi trường**, nhưng không thể ngăn chặn hoàn toàn thiên tai.
- Giao diện và biểu tượng (logo, màu sắc) do dự án tự thiết kế, không sao chép tài nguyên của bên thứ ba.

## Công nghệ

React 18 + TypeScript + Vite 5, CSS thuần, `react-router-dom` (HashRouter). Logic trận đấu là một *reducer/máy trạng thái thuần* điều khiển bằng đồng hồ đơn điệu (`performance.now()`) nên kiểm thử được (Vitest). Âm thanh tạo bằng Web Audio API. Nhập Excel dùng SheetJS (`xlsx`) được **tách thành chunk nạp động** để bundle chính nhẹ. Hỗ trợ `prefers-reduced-motion`.

## Cấu trúc thư mục chính

```
src/
  engine/      # model, reducer, selectors, setup — logic trận đấu thuần
  hooks/       # useMatch, useSound, useFullscreen
  storage/     # lưu localStorage, kiểm tra & chuẩn hóa dữ liệu
  ui/          # màn hình & thành phần giao diện
  utils/       # excel (nạp động), download
  data/        # câu hỏi mẫu, giá trị mặc định
```

