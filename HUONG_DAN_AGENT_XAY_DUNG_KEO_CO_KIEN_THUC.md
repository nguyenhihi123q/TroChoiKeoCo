# Hướng dẫn agent xây dựng trò chơi Kéo co kiến thức

## 1. Nhiệm vụ và kết quả cần giao

Hãy xây dựng một ứng dụng web hoàn chỉnh bằng tiếng Việt mang tên **Kéo co kiến thức**, có thể triển khai lên Vercel. Đây là sản phẩm giáo dục lối sống xanh dành cho học sinh Trường THPT Hai Bà Trưng, thành phố Huế. Nội dung câu hỏi xoay quanh bão lụt, ứng phó thiên tai, bảo vệ môi trường và hành vi sống xanh.

Người dùng muốn trải nghiệm tương tự trò kéo co trên website Giáo viên đổi mới đã cung cấp qua 5 ảnh tham khảo: màn hình quản lý trò chơi, màn hình tạo/cấu hình, hộp phổ biến luật trước trận và màn hình thi đấu hai đội có hoạt cảnh kéo co ở giữa.

Phải tạo sản phẩm chạy được, có logic trận đấu, dữ liệu được lưu và hoạt cảnh thực sự phản ứng với câu trả lời. Không chỉ dựng giao diện tĩnh hoặc các nút giả. Tự thực hiện các quyết định kỹ thuật thông thường, chạy kiểm tra và sửa lỗi trước khi bàn giao.

Phạm vi bản này là **hai đội chơi chung một máy**, giáo viên chiếu lên màn hình lớp. Điều khiển bằng bàn phím, chuột hoặc màn hình cảm ứng. Chưa cần tài khoản, phòng chơi qua QR, nhiều điện thoại đồng bộ hoặc máy chủ thời gian thực. Không xây trò Nhanh như chớp trong đợt này.

## 2. Cách sử dụng tài liệu và ảnh tham khảo

Tài liệu này là đặc tả triển khai. Nếu nhận được 5 ảnh gốc cùng tài liệu, dùng ảnh để đối chiếu bố cục, màu sắc và các thành phần giao diện. Nếu không có ảnh, vẫn phải triển khai đầy đủ theo mô tả bên dưới; không phụ thuộc đường dẫn ảnh tạm trên máy của người soạn.

Các ảnh mô tả:

1. Hộp mở đầu nền tím đậm trên lớp phủ tối, tiêu đề vàng, các dòng luật, tên hai đội và nút Bắt đầu/Toàn màn hình.
2. Màn hình trận đấu: bảng xanh bên trái, hoạt cảnh kéo co nền sáng ở giữa, bảng đỏ bên phải; thanh trên có tên bài, điểm, đồng hồ và điều khiển.
3. Trang thư viện trò chơi: thanh bên trái, nền chuyển sắc tím, vùng nội dung trắng, thẻ trò chơi có tên, số câu, thời lượng và các thao tác.
4. Nửa đầu trang tạo trò chơi: tên bài, thời lượng, ngưỡng thắng, thời gian đóng băng, tên đội, ba chế độ chơi và phương thức điều khiển.
5. Nửa sau trang tạo trò chơi: thứ tự câu, đảo đáp án, hết câu thì kết thúc, nhạc nền và các cách nhập câu hỏi.

Tạo thương hiệu và hình minh họa riêng. Không sao chép logo Giáo viên đổi mới, mã nguồn hay tài sản độc quyền từ website tham khảo. Không cần tái hiện thanh quảng bá, mua gói, số ngày sử dụng, công cụ AI hoặc các mục không thuộc trò chơi.

## 3. Công nghệ và cấu trúc

- Dùng React, TypeScript và Vite; CSS tự viết hoặc Tailwind tùy môi trường dự án.
- Chạy logic trò chơi ngay trong trình duyệt. Dùng reducer/state machine hoặc cấu trúc tương đương để quản lý trạng thái rõ ràng.
- Lưu thư viện trò chơi và cài đặt bằng localStorage có phiên bản dữ liệu; có xuất/nhập JSON để sao lưu và chuyển máy.
- Giải thích trong README rằng dữ liệu trình duyệt không tự đồng bộ giữa các máy và có thể mất khi xóa dữ liệu trình duyệt.
- Dùng SVG tự tạo hoặc đồ họa có giấy phép phù hợp cho dây và nhân vật. Ưu tiên đồ họa vector sắc nét khi chiếu.
- Tách giao diện quản lý, bộ đọc dữ liệu câu hỏi, bộ máy trận đấu, âm thanh và hoạt cảnh thành các module dễ bảo trì.
- Không đưa khóa API hoặc thông tin bí mật vào mã phía trình duyệt.
- Bàn giao mã nguồn, lockfile, README, dữ liệu mẫu và cấu hình triển khai cần thiết.

## 4. Các màn hình bắt buộc

### 4.1. Thư viện trò chơi

Thiết kế gần ảnh tham khảo: sidebar sáng rộng khoảng 250–280 px trên desktop; nền ngoài chuyển sắc xanh tím; nội dung nằm trong một khung trắng lớn bo góc.

Sidebar có tên sản phẩm và các mục: Trò chơi của tôi, Tạo trò chơi mới, Hướng dẫn sử dụng. Trên màn hình nhỏ, sidebar thu gọn.

Vùng chính có tiêu đề, tìm kiếm theo tên, sắp xếp mới nhất/cũ nhất/tên và nút tạo mới. Mỗi trò chơi là một thẻ hiển thị tên bài, số câu, thời gian, chế độ và các nút:

- Chơi: vào hộp phổ biến luật.
- Chỉnh sửa: mở lại toàn bộ cấu hình và câu hỏi.
- Nhân bản: tạo bản sao độc lập.
- Xuất JSON: tải cấu hình và câu hỏi.
- Xóa: yêu cầu xác nhận trong giao diện.

Có nhập JSON từ máy và trạng thái trống dễ hiểu. Khi mở lần đầu, cung cấp một trò mẫu về lối sống xanh để chơi ngay.

### 4.2. Tạo và chỉnh sửa trò chơi

Form hai cột trên desktop, một cột trên màn hình nhỏ. Các trường:

| Trường | Giá trị mặc định và yêu cầu |
| --- | --- |
| Tiêu đề | Kéo co kiến thức về lối sống xanh; bắt buộc nhập |
| Tên đội trái | Đội Xanh |
| Tên đội phải | Đội Đỏ |
| Thời lượng | 300 giây; có lựa chọn 60, 120, 180, 300 và tùy chỉnh |
| Ngưỡng thắng | 5; số nguyên dương |
| Đóng băng khi sai | 3 giây; cho chỉnh từ 1 đến 10 giây |
| Chế độ | Độc lập, Cùng câu hỏi, Chạm mốc |
| Điều khiển | Cảm ứng/chuột hoặc Bàn phím; click vẫn hoạt động ở chế độ bàn phím |
| Thứ tự câu hỏi | Ngẫu nhiên hoặc giữ thứ tự |
| Đảo đáp án | Bật mặc định; lưu đáp án đúng theo ID, không theo vị trí |
| Hết câu thì kết thúc | Tắt mặc định; có quy tắc rõ tại mục luật |
| Âm thanh | Bật/tắt hiệu ứng và nhạc nền riêng; có âm lượng |

Mặc định dùng **Độc lập**, thời lượng **5 phút**, ngưỡng **5**, đóng băng **3 giây** theo kế hoạch nghiên cứu. Cho phép người dùng chọn **Cùng câu hỏi, 60 giây** để tái hiện trận minh họa trong ảnh.

Không triển khai lựa chọn Đua thuyền rồng trong bản này. Không hiển thị lựa chọn chưa hoạt động.

Cuối form có Lưu trò chơi, Lưu và chơi, Hủy. Cảnh báo khi rời form có thay đổi chưa lưu. Báo lỗi cạnh trường tương ứng, không chỉ bằng alert.

### 4.3. Soạn và nhập câu hỏi

Mỗi câu có ID ổn định, nội dung, đúng 4 lựa chọn, một đáp án đúng, giải thích ngắn và chủ đề. Cho thêm, sửa, xóa và đổi thứ tự câu.

Hỗ trợ:

- Nhập thủ công.
- Chọn câu từ kho mẫu tích hợp.
- Nhập JSON đúng schema được cung cấp.
- Nhập Excel `.xlsx` và tải file mẫu, các cột: `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, `explanation`, `topic`. `correctAnswer` nhận A/B/C/D.

Trước khi nhập, hiển thị bản xem trước và lỗi theo số dòng. Không âm thầm bỏ câu lỗi. Cho chọn thay thế bộ hiện tại hoặc thêm vào. Yêu cầu ít nhất 5 câu hợp lệ trước khi chơi.

Không cần tích hợp AI tạo câu hỏi hoặc tải âm thanh riêng ở bản đầu. Không tạo nút mang tên những tính năng này nếu chưa hoạt động.

### 4.4. Hộp trước trận

Lớp phủ làm tối nền, hộp tím đậm bo góc ở giữa, tiêu đề vàng dễ đọc. Hiển thị luật được sinh từ cấu hình thực tế:

- Thời lượng.
- Điều kiện chiến thắng của chế độ đang chọn.
- Cách chuyển câu.
- Thời gian đóng băng khi sai.
- Hướng dẫn phím hoặc cảm ứng.

Hai huy hiệu Đội Xanh và Đội Đỏ ở dưới. Có nút Toàn màn hình và Bắt đầu. Sau khi nhấn Bắt đầu, đếm 3–2–1 rồi mới chạy đồng hồ và nhận đáp án. Không phát âm thanh trước tương tác của người dùng.

### 4.5. Màn hình trận đấu

Trên desktop 16:9, bố cục ba cột khoảng **33% – 34% – 33%**:

- Trái: nền xanh, câu hỏi và 4 đáp án lưới 2×2.
- Giữa: sân kéo co nền sáng, vạch giữa nét đứt, dây có nơ đánh dấu và hai nhóm nhân vật xanh/đỏ.
- Phải: nền đỏ, câu hỏi và 4 đáp án lưới 2×2.

Thanh trên gồm tên bài, điểm mỗi đội, đồng hồ ở giữa, bật/tắt âm, toàn màn hình và nút mở bảng điều khiển giáo viên. Tiêu đề dài phải co hoặc xuống dòng, không đè lên đồng hồ.

Khác với lỗi nhìn thấy trong ảnh, **không dùng chữ lớn tới mức câu hỏi thông thường bị cắt và phải cuộn**. Dùng cỡ chữ thích ứng và giới hạn độ dài có hướng dẫn khi soạn. Với câu quá dài, vẫn có cơ chế cuộn dự phòng và cảnh báo khi xem trước. Kiểm tra ít nhất ở 1366×768 và 1920×1080, mức zoom 100%.

Đáp án là nút sáng, chữ đậm màu tối, có nhãn A/B/C/D theo vị trí hiện tại và huy hiệu phím tắt. Khi đảo đáp án, gán lại nhãn hiển thị theo vị trí để không tạo thứ tự D/C/A/B gây nhầm; ID đáp án vẫn giữ nguyên.

Điều khiển bàn phím theo vị trí trên trái, trên phải, dưới trái, dưới phải:

| Đội | Bốn phím |
| --- | --- |
| Xanh | Q, W, A, S |
| Đỏ | O, P, K, L |

Bỏ qua key repeat. Không xử lý phím chơi khi người dùng đang nhập form hoặc hộp điều khiển. Hai vùng cảm ứng phải nhận thao tác độc lập bằng Pointer Events, tránh khóa toàn màn hình khi một bên đang chạm.

Trên thiết bị hẹp, vẫn hiển thị được nhưng thông báo xoay ngang để chơi thuận tiện. Không yêu cầu điện thoại để sử dụng.

## 5. Luật và bộ máy trận đấu

### 5.1. Trạng thái và đồng hồ

Các trạng thái tối thiểu: `ready`, `countdown`, `playing`, `paused`, `suddenDeath`, `finished`.

Dùng thời gian trôi thực tế với đồng hồ đơn điệu như `performance.now()`, không giả định mỗi lần interval chạy là đúng một giây. Pause phải dừng thời gian trận, thời gian đóng băng và thời gian chuyển câu. Khi quay lại, tiếp tục phần thời gian còn lại.

Nếu tab bị ẩn, tự tạm dừng và yêu cầu tiếp tục khi trở lại. Không để trận âm thầm hết giờ trong tab nền. Hết giờ khóa input ngay; đáp án đến sau thời hạn không được cộng điểm.

Mỗi lần nhận đáp án phải gắn với ID câu hiện tại và lượt hiện tại. Loại bỏ sự kiện cũ, nhấp đúp hoặc callback từ trận đã reset. Hủy timer/listener khi thoát.

### 5.2. Chế độ Độc lập

Đây là chế độ chính của kế hoạch. Hai đội có tiến độ riêng, đội này không phải chờ đội kia.

- Đúng: cộng 1 điểm cho đội, tạo 1 lực kéo về phía đội đó, phản hồi ngắn khoảng 300–500 ms rồi chuyển câu riêng của đội.
- Sai: không cộng/trừ điểm, đóng băng riêng vùng trả lời của đội trong thời gian cấu hình; hiện lớp phủ băng và số giây còn lại.
- Hết đóng băng: tiếp tục **chính câu đó**, chưa tiết lộ đáp án đúng. Đối thủ tiếp tục chơi bình thường.
- Khi một đội đã hết bộ câu và tùy chọn kết thúc đang tắt, tạo vòng câu mới. Không cho câu cuối lặp lại ngay ở đầu vòng mới nếu có thể.
- Nếu tùy chọn kết thúc đang bật, đội hết câu chuyển sang trạng thái Đã hoàn thành; đội còn lại tiếp tục. Trận kết thúc khi cả hai hoàn thành hoặc hết giờ/đạt ngưỡng.

Để công bằng, hai đội dùng cùng nguồn câu hỏi, không chọn ngẫu nhiên một bộ dễ và một bộ khó. Nếu bật xáo trộn, có thể dùng cùng thứ tự câu đã xáo cho hai đội; tiến độ và thứ tự đáp án vẫn độc lập.

Quy ước vị trí dây: `rope = điểm Đỏ - điểm Xanh`. Ban đầu 0; Xanh đúng thì giảm 1, Đỏ đúng thì tăng 1. Xanh thắng khi `rope <= -ngưỡng`; Đỏ thắng khi `rope >= ngưỡng`. **Đạt ngưỡng đã thắng**, không phải đợi vượt ngưỡng.

### 5.3. Chế độ Cùng câu hỏi

Hai đội thấy cùng câu; thứ tự đáp án có thể khác nhau. Đội trả lời đúng trước nhận 1 điểm và kéo dây 1 bước; cả hai chuyển sang câu mới sau phản hồi ngắn.

- Sai chỉ đóng băng đội sai; đội còn lại vẫn trả lời.
- Nếu câu chuyển trong khi một đội đang đóng băng, đội đó thấy câu mới nhưng vẫn phải chờ hết thời gian đóng băng còn lại.
- Mỗi câu chỉ được tính điểm đúng một lần. Khóa lượt câu ngay khi chấp nhận đáp án đúng đầu tiên.
- Nếu hai đáp án đúng tới trong cùng một frame xử lý và không phân định được trước sau, coi như đồng thời: không đổi chênh lệch, thông báo ngắn rồi chuyển câu. Quy tắc này phải được ghi trong hướng dẫn.
- Hết bộ câu: kết thúc và so điểm nếu bật tùy chọn kết thúc; nếu không, tạo vòng câu mới.

### 5.4. Chế độ Chạm mốc

Hai đội trả lời độc lập. Đội có số câu đúng đạt ngưỡng cấu hình trước thắng, không xét khoảng cách điểm để thắng. Sai vẫn đóng băng, sau đó trả lời lại câu hiện tại.

Hiển thị tiến độ `điểm/ngưỡng` rõ ràng. Hoạt cảnh dây vẫn thể hiện chênh lệch, nhưng không dùng vị trí dây để tuyên bố thắng ở chế độ này. Nếu cả hai cùng đạt mốc trong cùng frame, vào câu sinh tử.

### 5.5. Sự kiện đồng thời

Trong chế độ độc lập, gom các đáp án hợp lệ cùng frame rồi cập nhật điểm/vị trí dây một lần trước khi xét thắng. Nếu hai bên cùng đúng, cả hai được điểm và lực triệt tiêu. Không để callback bên trái luôn có lợi thế do thứ tự code.

Khóa input riêng từng đội trong phản hồi 300–500 ms. Không nhận đáp án khi countdown, paused, frozen hoặc finished. Không sử dụng thời lượng hoạt cảnh làm nguồn sự thật cho điểm số.

### 5.6. Hết giờ và sinh tử

Hết giờ hoặc hết bộ câu theo quy tắc: đội nhiều điểm hơn thắng; bằng điểm vào sinh tử. Với chế độ kéo theo chênh lệch, điều này tương đương so vị trí dây.

Sinh tử dùng một câu chung mới, mỗi đội có một lần chọn trong lượt:

- Một đội đúng trước thì thắng.
- Đội sai bị khóa tới hết lượt; bên còn lại vẫn có thể chọn.
- Hai đội đều sai: chuyển sang câu sinh tử tiếp theo.
- Cả hai cùng đúng trong cùng frame: chuyển sang câu sinh tử tiếp theo.
- Mỗi lượt tối đa 20 giây; hết lượt mà chưa có người thắng thì đổi câu.

Giáo viên có thể kết thúc thủ công và ghi nhận hòa, tránh mắc kẹt nếu lớp không thể tiếp tục.

## 6. Hoạt cảnh và âm thanh

Hoạt cảnh phải là điểm nổi bật của sản phẩm, không thay bằng emoji hoặc một thanh tiến trình đơn giản.

- Mỗi bên khoảng 3 nhân vật hoạt hình, có màu đội riêng, cầm một sợi dây nối liên tục.
- Trạng thái cân bằng: tư thế kéo, chuyển động nhẹ.
- Trả lời đúng: đội đó giật kéo, dây/nơ và hai nhóm dịch chuyển mượt theo vị trí logic.
- Gần thua: nhóm bị kéo nghiêng hoặc trượt nhẹ; vẫn giữ hình trong vùng hiển thị.
- Đóng băng: lớp băng ở vùng đáp án của đội bị phạt, không phủ đội còn lại.
- Thắng: động tác ăn mừng, confetti và tên đội thắng.

Dùng SVG/CSS hoặc canvas nếu cần, bảo đảm không kéo giãn hình méo. Có chế độ giảm chuyển động theo `prefers-reduced-motion`. Nhạc nền nhẹ, hiệu ứng đúng/sai/kết thúc ngắn; âm thanh chỉ là bổ trợ, mọi trạng thái đều có tín hiệu bằng chữ/hình.

## 7. Điều khiển giáo viên và kết quả

Bảng điều khiển giáo viên có: Tạm dừng/Tiếp tục, Bỏ câu của từng đội hoặc câu chung tùy chế độ, Chơi lại, Kết thúc trận, Sửa điểm.

- Mở bảng điều khiển thì tạm dừng trận.
- Bỏ câu không cộng/trừ điểm và xóa trạng thái đóng băng của câu bị bỏ.
- Sửa điểm có xác nhận, không cho số âm; cập nhật lại dây và điều kiện thắng nhất quán.
- Chơi lại và Thoát yêu cầu xác nhận nếu trận đang diễn ra.
- Kết thúc thủ công cho phép xác nhận kết quả hiện tại hoặc ghi hòa; không tự gán người thắng khi bằng điểm.

Màn hình kết quả có đội thắng/hòa, điểm, số lần trả lời sai, tổng lần thử, thời gian chơi và nút Chơi lại/Về thư viện/Xem lại câu hỏi. Phần xem lại hiển thị đáp án đúng và giải thích, phục vụ giáo viên tổng kết kiến thức. Thống kê phải phân biệt số câu hoàn thành với số lần thử để việc đoán nhiều lần không làm sai dữ liệu.

## 8. Kho câu hỏi mẫu

Chuẩn bị tối thiểu 20 câu tiếng Việt, mỗi câu 4 đáp án và giải thích ngắn, chia đều tương đối cho:

1. Nhận thức bão lụt.
2. Ứng phó an toàn trước, trong và sau thiên tai.
3. Rác thải và bảo vệ hệ thống thoát nước.
4. Tiết kiệm tài nguyên, giảm nhựa dùng một lần.
5. Hành động của học sinh, gia đình và nhà trường.

Nội dung phải phù hợp học sinh THPT. Với hướng dẫn an toàn thiên tai, kiểm chứng qua nguồn chính thức và lưu nguồn trong dữ liệu/README. Không đưa lời khuyên như ra ngoài dọn cống lúc ngập, đi qua dòng nước lũ hoặc chạm thiết bị điện bị ướt. Không khẳng định hành vi sống xanh có thể ngăn hoàn toàn bão lụt. Tránh câu có nhiều đáp án đều hợp lý nhưng chỉ gán một đáp án đúng.

Ví dụ định hướng: “Trong sinh hoạt hằng ngày, lựa chọn nào giúp giảm rác nhựa dùng một lần?” — đáp án đúng có thể là mang bình nước cá nhân dùng nhiều lần. Đừng dùng nội dung tế bào trong ảnh làm bộ mặc định; đó chỉ là ví dụ giao diện.

## 9. Mô hình dữ liệu gợi ý

```ts
type GameMode = 'independent' | 'shared' | 'race';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  topic: string;
  sourceUrl?: string;
}

interface GameConfig {
  id: string;
  title: string;
  teamNames: [string, string];
  durationSeconds: number;
  winThreshold: number;
  freezeSeconds: number;
  mode: GameMode;
  inputMode: 'touch' | 'keyboard';
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  endWhenQuestionsExhausted: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}
```

Có thể điều chỉnh schema nhưng phải giữ các hành vi yêu cầu. Validate dữ liệu từ file và localStorage trước khi dùng; xử lý dữ liệu hỏng bằng thông báo và phương án khôi phục, không làm trắng trang. Hiển thị văn bản câu hỏi như text, không chạy HTML hoặc script từ file nhập.

## 10. Kiểm thử và tiêu chí nghiệm thu

Viết kiểm thử bộ máy trò chơi bằng đồng hồ giả hoặc cơ chế tương đương cho các tình huống có ảnh hưởng tới kết quả:

- Xanh đúng kéo trái, Đỏ đúng kéo phải; đạt ngưỡng thì kết thúc đúng đội.
- Sai đóng băng đúng một đội, không chặn đối thủ; hết đóng băng vẫn ở câu cũ.
- Pause/Resume giữ nguyên thời gian trận và đóng băng còn lại.
- Hai bên cùng đúng trong một frame không gây chiến thắng sai ở sát ngưỡng.
- Chế độ câu chung không cộng hai lần cho một lượt.
- Chạm mốc xét điểm tuyệt đối, không nhầm với chênh lệch.
- Đảo đáp án vẫn chấm đúng theo ID.
- Hết giờ khóa input, hòa vào sinh tử; sinh tử xử lý cả hai sai/cùng đúng.
- Reset/thoát không còn timer hoặc sự kiện của trận trước.
- Nhập file sai schema cho thông báo có ích, không làm mất bộ câu đang có.

Kiểm tra bằng trình duyệt thực tế:

- Tạo → lưu → tải lại trang → chỉnh sửa → chơi → kết quả hoạt động đầy đủ.
- Nhập/xuất JSON và Excel mẫu hoạt động.
- Bàn phím hai bên, click và cảm ứng nếu môi trường cho phép.
- Nút toàn màn hình xử lý được trường hợp trình duyệt từ chối.
- Hai độ phân giải 1366×768 và 1920×1080 không có chồng chữ, tràn nút hoặc câu hỏi mẫu bị cắt.
- Không có lỗi console, lỗi TypeScript hoặc build thất bại.

Không tuyên bố đã thử cảm ứng đa điểm, âm thanh hay triển khai trực tuyến nếu môi trường chưa cho phép kiểm tra. Ghi rõ kiểm tra nào đã chạy và phần nào còn cần người dùng xác nhận.

## 11. Triển khai lên Vercel

Chuẩn bị dự án để Vercel nhận diện Vite, build bằng `npm run build`, thư mục đầu ra `dist`. Nếu dùng client-side routing, cấu hình fallback phù hợp để tải lại đường dẫn con không gặp 404. Có thể dùng hash routing để giảm cấu hình nếu phù hợp.

README phải có:

1. Yêu cầu môi trường và cài dependencies từ lockfile.
2. Chạy local bằng `npm run dev`.
3. Kiểm thử và build production.
4. Cách import repository lên Vercel hoặc triển khai bằng Vercel CLI.
5. Cách sử dụng, phím điều khiển và ba chế độ chơi.
6. Cách nhập bộ câu hỏi, sao lưu và giới hạn lưu dữ liệu trên trình duyệt.

Nếu người dùng đã cho phép triển khai và môi trường có đăng nhập Vercel, thực hiện deploy và kiểm tra URL thật. Nếu chưa có quyền/tài khoản kết nối, hoàn thiện mã nguồn và build trước, sau đó nêu chính xác bước đăng nhập/kết nối còn thiếu. Không yêu cầu người dùng gửi mật khẩu hoặc token vào cuộc trò chuyện. Không ghi đã deploy nếu chỉ mới build local.

Tài liệu tham khảo kỹ thuật chính thức: https://vercel.com/docs/frameworks/frontend/vite

## 12. Thứ tự thực hiện và bàn giao

1. Đọc cấu trúc dự án và hướng dẫn hiện có; bảo toàn các tài liệu nguồn.
2. Xây bộ máy trận đấu, dữ liệu và các kiểm thử quan trọng.
3. Dựng thư viện, trình soạn và nhập câu hỏi.
4. Xây màn hình trận đấu cùng hoạt cảnh kéo co hoàn chỉnh.
5. Hoàn thiện âm thanh, bảng điều khiển và kết quả.
6. Chạy kiểm thử, kiểm tra trực quan và build production; sửa lỗi phát hiện.
7. Chuẩn bị hoặc thực hiện triển khai Vercel tùy quyền đã có.

Khi bàn giao, nêu ngắn gọn tính năng đã hoàn thành, cách chạy, kết quả kiểm tra, vị trí mã nguồn, URL nếu đã triển khai và giới hạn còn lại. Không tự mở rộng sang thanh toán, đăng nhập, AI, trò chơi khác hoặc hệ thống nhiều thiết bị trước khi hoàn thành toàn bộ phạm vi trên.
