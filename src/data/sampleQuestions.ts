// Kho câu hỏi mẫu tiếng Việt về lối sống xanh, bão lụt và ứng phó thiên tai
// cho học sinh THPT. Mỗi câu có đúng một đáp án đúng rõ ràng.
//
// Lưu ý nguồn: nội dung an toàn thiên tai bám theo khuyến cáo phổ biến của cơ
// quan chức năng (Cục Quản lý đê điều và Phòng, chống thiên tai; hướng dẫn kỹ
// thuật của Bộ Xây dựng). Giáo viên nên rà soát trước khi dùng trên lớp.
import type { Question } from '../types';

const T1 = 'Nhận thức bão lụt';
const T2 = 'Ứng phó an toàn';
const T3 = 'Rác thải & thoát nước';
const T4 = 'Tiết kiệm tài nguyên';
const T5 = 'Hành động xanh';

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'sq-01',
    text: 'Dấu hiệu nào dưới đây thường báo hiệu một cơn bão sắp ảnh hưởng?',
    options: [
      { id: 'sq-01-a', text: 'Trời quang mây tạnh kéo dài nhiều ngày' },
      { id: 'sq-01-b', text: 'Mây đen dày lên nhanh, gió mạnh dần, áp suất khí quyển giảm' },
      { id: 'sq-01-c', text: 'Nhiệt độ giảm sâu kèm theo tuyết rơi' },
      { id: 'sq-01-d', text: 'Nước biển rút cạn hẳn trong nhiều ngày' },
    ],
    correctOptionId: 'sq-01-b',
    explanation: 'Trước bão thường có mây dày lên nhanh, gió mạnh dần và áp suất khí quyển giảm.',
    topic: T1,
  },
  {
    id: 'sq-02',
    text: 'Lũ quét thường xảy ra ở địa hình nào và có đặc điểm gì?',
    options: [
      { id: 'sq-02-a', text: 'Vùng đồng bằng, diễn ra chậm trong nhiều ngày' },
      { id: 'sq-02-b', text: 'Vùng núi, sườn dốc; xảy ra rất nhanh và bất ngờ' },
      { id: 'sq-02-c', text: 'Chỉ ở ven biển khi có triều cường' },
      { id: 'sq-02-d', text: 'Chỉ trong thành phố khi có mưa nhỏ' },
    ],
    correctOptionId: 'sq-02-b',
    explanation: 'Lũ quét hay xảy ra ở miền núi, sườn dốc, dòng chảy mạnh và ập đến rất nhanh.',
    topic: T1,
  },
  {
    id: 'sq-03',
    text: 'Nên theo dõi dự báo, cảnh báo thiên tai từ nguồn nào là đáng tin cậy?',
    options: [
      { id: 'sq-03-a', text: 'Tin đồn lan truyền trên mạng xã hội' },
      { id: 'sq-03-b', text: 'Trung tâm Dự báo Khí tượng Thủy văn Quốc gia và cơ quan chức năng' },
      { id: 'sq-03-c', text: 'Lời kể chưa kiểm chứng của người quen' },
      { id: 'sq-03-d', text: 'Suy đoán cá nhân dựa trên cảm giác' },
    ],
    correctOptionId: 'sq-03-b',
    explanation: 'Hãy dùng thông tin chính thức từ cơ quan khí tượng thủy văn và chính quyền.',
    topic: T1,
  },
  {
    id: 'sq-04',
    text: 'Ngập úng đô thị khi mưa lớn chủ yếu trầm trọng thêm do nguyên nhân nào?',
    options: [
      { id: 'sq-04-a', text: 'Hệ thống thoát nước quá tải hoặc bị tắc do rác' },
      { id: 'sq-04-b', text: 'Do có nhiều cây xanh trong thành phố' },
      { id: 'sq-04-c', text: 'Do người dân tiết kiệm nước' },
      { id: 'sq-04-d', text: 'Do trời nắng kéo dài trước đó' },
    ],
    correctOptionId: 'sq-04-a',
    explanation: 'Cống rãnh tắc nghẽn và quá tải khiến nước không thoát kịp, gây ngập úng.',
    topic: T1,
  },
  {
    id: 'sq-05',
    text: 'Khi nhận được bản tin cảnh báo bão, thông tin nào quan trọng nhất cần nắm?',
    options: [
      { id: 'sq-05-a', text: 'Màu sắc của biểu tượng bản tin' },
      { id: 'sq-05-b', text: 'Cấp độ rủi ro, thời gian ảnh hưởng và khuyến cáo của chính quyền' },
      { id: 'sq-05-c', text: 'Số lượt chia sẻ bản tin trên mạng' },
      { id: 'sq-05-d', text: 'Tên người đăng bản tin' },
    ],
    correctOptionId: 'sq-05-b',
    explanation: 'Cần nắm cấp độ rủi ro, thời điểm ảnh hưởng và hướng dẫn ứng phó, sơ tán.',
    topic: T1,
  },
  {
    id: 'sq-06',
    text: 'Trước khi bão đến, gia đình nên chuẩn bị vật dụng nào sau đây?',
    options: [
      { id: 'sq-06-a', text: 'Túi đồ khẩn cấp: nước sạch, thực phẩm, đèn pin, thuốc, giấy tờ' },
      { id: 'sq-06-b', text: 'Chỉ cần điện thoại là đủ' },
      { id: 'sq-06-c', text: 'Không cần chuẩn bị gì, chờ bão qua' },
      { id: 'sq-06-d', text: 'Mua thật nhiều đồ nhựa dùng một lần' },
    ],
    correctOptionId: 'sq-06-a',
    explanation: 'Túi đồ khẩn cấp giúp gia đình chủ động khi mất điện, nước hoặc phải sơ tán.',
    topic: T2,
  },
  {
    id: 'sq-07',
    text: 'Gặp đoạn đường bị nước lũ chảy xiết, học sinh nên làm gì?',
    options: [
      { id: 'sq-07-a', text: 'Cố lội hoặc bơi qua cho nhanh' },
      { id: 'sq-07-b', text: 'Không đi qua dòng nước lũ; tìm nơi cao an toàn và báo người lớn' },
      { id: 'sq-07-c', text: 'Đứng sát mép nước để quay phim' },
      { id: 'sq-07-d', text: 'Rủ bạn cùng lội qua để hỗ trợ nhau' },
    ],
    correctOptionId: 'sq-07-b',
    explanation: 'Chỉ cần dòng nước ngập ngang bắp chân đã có thể cuốn ngã; tuyệt đối không băng qua.',
    topic: T2,
  },
  {
    id: 'sq-08',
    text: 'Thấy dây điện bị đứt rơi xuống khu vực ngập nước, cần xử lý thế nào?',
    options: [
      { id: 'sq-08-a', text: 'Đến gần để kiểm tra xem còn điện không' },
      { id: 'sq-08-b', text: 'Dùng tay nhấc dây điện ra khỏi nước' },
      { id: 'sq-08-c', text: 'Tránh xa, không chạm vào nước hay thiết bị điện; báo người lớn và điện lực' },
      { id: 'sq-08-d', text: 'Lội qua nhanh trước khi bị điện giật' },
    ],
    correctOptionId: 'sq-08-c',
    explanation: 'Nước dẫn điện rất nguy hiểm; hãy tránh xa và báo ngay cho người lớn, cơ quan điện lực.',
    topic: T2,
  },
  {
    id: 'sq-09',
    text: 'Khi chính quyền phát lệnh sơ tán do thiên tai, phản ứng đúng là gì?',
    options: [
      { id: 'sq-09-a', text: 'Ở lại nhà vì nghĩ sẽ an toàn hơn' },
      { id: 'sq-09-b', text: 'Chờ xem hàng xóm có đi không rồi mới quyết định' },
      { id: 'sq-09-c', text: 'Tuân theo hướng dẫn, di chuyển đến nơi trú ẩn được chỉ định' },
      { id: 'sq-09-d', text: 'Quay lại lấy hết đồ đạc rồi mới đi' },
    ],
    correctOptionId: 'sq-09-c',
    explanation: 'Lệnh sơ tán dựa trên đánh giá rủi ro; tuân thủ nhanh và đầy đủ giúp bảo đảm an toàn.',
    topic: T2,
  },
  {
    id: 'sq-10',
    text: 'Biện pháp nào phù hợp để giảm nguy cơ tốc mái nhà khi có bão?',
    options: [
      { id: 'sq-10-a', text: 'Chằng chống, gia cố mái và nhà cửa trước bão theo hướng dẫn kỹ thuật' },
      { id: 'sq-10-b', text: 'Mở toang hết cửa cho gió lùa qua' },
      { id: 'sq-10-c', text: 'Leo lên mái giữa lúc bão để giữ tôn' },
      { id: 'sq-10-d', text: 'Không cần làm gì vì mái sẽ tự chịu được' },
    ],
    correctOptionId: 'sq-10-a',
    explanation: 'Nên gia cố, chằng chống nhà cửa TRƯỚC bão; không trèo lên mái khi bão đang diễn ra.',
    topic: T2,
    sourceUrl:
      'https://moc.gov.vn/Images/editor/files/TL%20KT%20Xay%20dung/HD%20ky%20thuat%20xay%20dung%20phong%20va%20giam%20thieu%20thiet%20hai%20do%20gio,%20bao%20cho%20nha%20va%20cong%20trinh.pdf',
  },
  {
    id: 'sq-11',
    text: 'Vứt rác xuống cống, kênh rạch gây hậu quả gì khi có mưa lớn?',
    options: [
      { id: 'sq-11-a', text: 'Giúp nước thoát nhanh hơn' },
      { id: 'sq-11-b', text: 'Làm tắc nghẽn dòng chảy, tăng nguy cơ ngập úng' },
      { id: 'sq-11-c', text: 'Không ảnh hưởng gì đến thoát nước' },
      { id: 'sq-11-d', text: 'Làm nước sạch hơn' },
    ],
    correctOptionId: 'sq-11-b',
    explanation: 'Rác làm nghẽn cống rãnh khiến nước không thoát kịp, gây ngập úng nặng hơn.',
    topic: T3,
  },
  {
    id: 'sq-12',
    text: 'Hành động nào giúp bảo vệ hệ thống thoát nước của khu dân cư?',
    options: [
      { id: 'sq-12-a', text: 'Đổ dầu mỡ thừa xuống bồn rửa và cống' },
      { id: 'sq-12-b', text: 'Quét rác xuống miệng cống cho gọn' },
      { id: 'sq-12-c', text: 'Bỏ rác đúng nơi quy định, không đổ rác và dầu mỡ xuống cống' },
      { id: 'sq-12-d', text: 'Trồng rau ngay trên miệng hố ga' },
    ],
    correctOptionId: 'sq-12-c',
    explanation: 'Giữ cống rãnh thông thoáng bằng cách bỏ rác đúng chỗ và không đổ dầu mỡ xuống cống.',
    topic: T3,
  },
  {
    id: 'sq-13',
    text: 'Phân loại rác tại nguồn mang lại lợi ích nào?',
    options: [
      { id: 'sq-13-a', text: 'Tăng khả năng tái chế, giảm rác chôn lấp và ô nhiễm' },
      { id: 'sq-13-b', text: 'Làm rác nhiều hơn' },
      { id: 'sq-13-c', text: 'Khiến việc thu gom khó khăn hơn' },
      { id: 'sq-13-d', text: 'Không có tác dụng gì' },
    ],
    correctOptionId: 'sq-13-a',
    explanation: 'Phân loại đúng giúp tái chế hiệu quả, giảm lượng rác phải chôn lấp và ô nhiễm.',
    topic: T3,
  },
  {
    id: 'sq-14',
    text: 'Túi ni lông và nhựa dùng một lần ảnh hưởng đến môi trường như thế nào?',
    options: [
      { id: 'sq-14-a', text: 'Phân hủy trong vài ngày nên vô hại' },
      { id: 'sq-14-b', text: 'Tồn tại rất lâu, gây tắc cống và ô nhiễm đất, nước' },
      { id: 'sq-14-c', text: 'Giúp cải tạo đất trồng' },
      { id: 'sq-14-d', text: 'Làm nước sạch hơn' },
    ],
    correctOptionId: 'sq-14-b',
    explanation: 'Nhựa khó phân hủy tồn tại hàng chục đến hàng trăm năm, gây tắc cống và ô nhiễm.',
    topic: T3,
  },
  {
    id: 'sq-15',
    text: 'Trong sinh hoạt hằng ngày, lựa chọn nào giúp giảm rác nhựa dùng một lần?',
    options: [
      { id: 'sq-15-a', text: 'Mang theo bình nước cá nhân dùng nhiều lần' },
      { id: 'sq-15-b', text: 'Mua nước đóng chai nhựa mỗi lần khát' },
      { id: 'sq-15-c', text: 'Dùng ống hút nhựa cho tiện' },
      { id: 'sq-15-d', text: 'Lấy thật nhiều túi ni lông khi đi mua sắm' },
    ],
    correctOptionId: 'sq-15-a',
    explanation: 'Bình nước cá nhân tái sử dụng giúp giảm đáng kể rác nhựa dùng một lần.',
    topic: T4,
  },
  {
    id: 'sq-16',
    text: 'Cách nào giúp tiết kiệm điện hiệu quả trong lớp học?',
    options: [
      { id: 'sq-16-a', text: 'Bật tất cả đèn và quạt cả ngày cho mát' },
      { id: 'sq-16-b', text: 'Tắt đèn, quạt và thiết bị khi ra khỏi phòng hoặc khi không dùng' },
      { id: 'sq-16-c', text: 'Mở cửa sổ nhưng vẫn bật máy lạnh hết cỡ' },
      { id: 'sq-16-d', text: 'Để máy chiếu chạy suốt giờ ra chơi' },
    ],
    correctOptionId: 'sq-16-b',
    explanation: 'Tắt thiết bị khi không sử dụng là cách tiết kiệm điện đơn giản mà hiệu quả.',
    topic: T4,
  },
  {
    id: 'sq-17',
    text: 'Biện pháp nào giúp tiết kiệm nước sinh hoạt?',
    options: [
      { id: 'sq-17-a', text: 'Để vòi chảy liên tục khi đánh răng' },
      { id: 'sq-17-b', text: 'Khóa vòi khi không dùng và sửa ngay vòi bị rò rỉ' },
      { id: 'sq-17-c', text: 'Rửa xe bằng vòi xả mạnh thật lâu' },
      { id: 'sq-17-d', text: 'Xả nước bỏ đi cho sạch bể' },
    ],
    correctOptionId: 'sq-17-b',
    explanation: 'Khóa vòi khi không dùng và sửa chỗ rò rỉ giúp tránh lãng phí nước sạch.',
    topic: T4,
  },
  {
    id: 'sq-18',
    text: 'Để giảm phát thải khi đi học ở quãng đường gần, nên ưu tiên phương tiện nào?',
    options: [
      { id: 'sq-18-a', text: 'Đi bộ, đi xe đạp hoặc đi xe buýt' },
      { id: 'sq-18-b', text: 'Mỗi người đi một xe máy riêng' },
      { id: 'sq-18-c', text: 'Nhờ ô tô chở dù nhà rất gần' },
      { id: 'sq-18-d', text: 'Đi vòng thật xa cho vui' },
    ],
    correctOptionId: 'sq-18-a',
    explanation: 'Đi bộ, xe đạp hoặc phương tiện công cộng giúp giảm khí thải và tốt cho sức khỏe.',
    topic: T4,
  },
  {
    id: 'sq-19',
    text: 'Học sinh có thể góp phần giảm rác nhựa ở trường bằng cách nào?',
    options: [
      { id: 'sq-19-a', text: 'Dùng hộp và chai tái sử dụng, hạn chế đồ nhựa dùng một lần' },
      { id: 'sq-19-b', text: 'Mua đồ ăn gói trong nhiều lớp nhựa' },
      { id: 'sq-19-c', text: 'Vứt chai nhựa ra sân trường' },
      { id: 'sq-19-d', text: 'Dùng một lần rồi bỏ cho tiện' },
    ],
    correctOptionId: 'sq-19-a',
    explanation: 'Ưu tiên vật dụng tái sử dụng là cách thiết thực để giảm rác nhựa ở trường học.',
    topic: T5,
  },
  {
    id: 'sq-20',
    text: 'Hoạt động nào của trường giúp nâng cao ý thức sống xanh cho học sinh?',
    options: [
      { id: 'sq-20-a', text: 'Tổ chức ngày hội tái chế, trồng cây và dọn vệ sinh môi trường' },
      { id: 'sq-20-b', text: 'Khuyến khích dùng nhiều đồ nhựa một lần' },
      { id: 'sq-20-c', text: 'Đốt rác ngay trong sân trường' },
      { id: 'sq-20-d', text: 'Bỏ mặc khuôn viên đầy rác' },
    ],
    correctOptionId: 'sq-20-a',
    explanation: 'Các hoạt động tái chế, trồng cây, dọn vệ sinh giúp lan tỏa lối sống xanh.',
    topic: T5,
  },
  {
    id: 'sq-21',
    text: 'Trồng và chăm sóc cây xanh mang lại lợi ích nào sau đây?',
    options: [
      { id: 'sq-21-a', text: 'Tạo bóng mát, cải thiện chất lượng không khí và giảm xói mòn đất' },
      { id: 'sq-21-b', text: 'Làm không khí ô nhiễm hơn' },
      { id: 'sq-21-c', text: 'Khiến đất dễ sạt lở hơn' },
      { id: 'sq-21-d', text: 'Không có lợi ích gì' },
    ],
    correctOptionId: 'sq-21-a',
    explanation: 'Cây xanh giúp che mát, lọc không khí và giữ đất, hạn chế xói mòn.',
    topic: T5,
  },
  {
    id: 'sq-22',
    text: 'Nhận định nào ĐÚNG về vai trò của lối sống xanh đối với thiên tai?',
    options: [
      { id: 'sq-22-a', text: 'Sống xanh có thể ngăn chặn hoàn toàn bão, lụt' },
      { id: 'sq-22-b', text: 'Sống xanh giúp giảm nhẹ rủi ro và bảo vệ môi trường, nhưng không thể ngăn hoàn toàn bão lụt' },
      { id: 'sq-22-c', text: 'Sống xanh không liên quan gì đến thiên tai' },
      { id: 'sq-22-d', text: 'Chỉ cần sống xanh là không bao giờ bị ngập' },
    ],
    correctOptionId: 'sq-22-b',
    explanation: 'Lối sống xanh giúp giảm nhẹ rủi ro và bảo vệ môi trường, nhưng không thể loại bỏ hoàn toàn thiên tai.',
    topic: T5,
  },
];

