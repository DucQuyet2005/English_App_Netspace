# Recall\_day6\_08\_06

1. Bình chọn Show\&Tell "Output AI thú vị nhất": Student Expense Manage \- Tuấn Vũ



2. PLANNING sản phảm LINGOFLOW:



Tài liệu này được thống nhất giữa Product Owner \(PO\) và Đội ngũ Phát triển \(Dev\) nhằm định hình tầm nhìn, cấu trúc và kế hoạch Sprint chi tiết cho ứng dụng **LingoFlow** \- Hệ thống học tiếng Anh đột phá theo phương pháp lặp lại ngắt quãng \(Leitner System\)\.



---



## **1\. Tổng quan \& Mục tiêu \(Overview \& Objectives\)**



### **\* 1\.1 Tên tính năng/Phân hệ chính:**

Dự án **LingoFlow** bao gồm các phân hệ cốt lõi sau:

1\. **Phát Âm \& Kiểm Tra Giọng Đọc \(Audio \& Pronunciation Engine\):** Hỗ trợ nghe phát âm người thật và ghi âm nhận diện giọng nói để chấm điểm\.

2\. **Đồng Bộ Hoá Tiện Ích Trình Duyệt \(Chrome Extension Hub\):** Tra từ trực tiếp trên trang web ngoài và lưu về tài khoản\.



### **\* 1\.2 Bối cảnh \(Context\):**

Người học tiếng Anh thường gặp hiện tượng "nhanh quên" do không ôn tập đúng thời điểm vàng \(đường cong lãng quên của Ebbinghaus\)\. Việc phân loại thủ công bằng flashcard giấy tốn nhiều công sức để sắp xếp lịch hẹn ôn tập\. 

**LingoFlow** số hóa toàn bộ quy trình này một cách thông minh\. Hơn thế nữa, để giải quyết trường hợp xấu nhất khi mất kết nối mạng hoặc sập máy chủ cơ sở dữ liệu \(MongoDB\), hệ thống tích hợp sẵn cấu trúc **Local DB Engine \(Đọc/Ghi cục bộ thông qua file JSON\)**, duy trì trải nghiệm học tập liên tục không ngắt quãng\.



### **\* 1\.3 Mục tiêu \(KPIs / Success Metrics\):**

\* **KPI 1:** Tăng 25% tỷ lệ ghi nhớ từ vựng dài hạn \(\>3 tháng\) sau 4 tuần ôn tập\.

\* **KPI 2:** Tỷ lệ giữ chân người dùng hàng tuần \(Weekly Retention\) đạt **50%**\.

\* **KPI 3:** Thời gian phản hồi của APIs luôn nhỏ hơn **150ms** trong điều kiện mạng tiêu chuẩn\.

\* **KPI 4:** 100% dữ liệu từ vựng và kết quả kiểm tra được sao lưu an toàn, không bị gián đoạn hoạt động ngay cả khi kết nối Database trung tâm sập \(đạt 99\.99% Uptime nhờ Fallback Engine\)\.



---

## **2\. Luồng nghiệp vụ \& Sơ đồ \(User Flow \& Architecture\)**



### **\* 2\.1 Luồng Nghiệp Vụ chính \(User Flow\)**

#### **Luồng Đồng Bộ Chrome Extension \(LingoFlow Helper\):**

1. Người dùng bôi đen từ vựng trên báo điện tử quốc tế $\rightarrow$ Bấm nút "Lưu vào LingoFlow"\.

2. Chrome Extension gửi Request \(chứa Token xác thực\) $\rightarrow$ API `/api/words` của Server $\rightarrow$ Lưu trữ thành công $\rightarrow$ Đẩy Toast thông báo trên giao diện trình duyệt\.

---



### **\* 2\.2 Quy định đặc biệt \& Xử lý Trường hợp Ngoại lệ \(Edge Cases\):**



|Kịch bản Ngoại lệ|Giải pháp Xử lý Kỹ thuật|Trải nghiệm UI/UX hiển thị|
|---|---|---|

\| **Nhập giọng đọc qua Micro nhưng môi trường xung quanh quá ồn** \| Áp dụng giải thuật Chuẩn hóa chuỗi \(String Normalization\): loại bỏ dấu câu, chuyển chữ thường, loại bỏ khoảng trắng thừa\. Sử dụng Levenshtein Distance để so sánh độ tương đồng âm bồi\. Nếu độ khớp $\ge 75\%$, vẫn chấp nhận là Đọc chính xác\. \| Hiển thị thông báo gợi ý: *"Phát âm của bạn giống khoảng 80%\. Khá tốt\!"* kèm theo chữ màu xanh lá\. \|

\| **Mất mạng khi đang lướt web bên ngoài và nhấn nút lưu nhanh từ vựng** \| Extension lưu tạm dữ liệu từ vựng bôi đen vào hàng đợi Offline Sync Queue \(`chrome.storage.local`\)\. Khi Service Worker phát hiện mạng khả dụng trở lại \(`navigator.onLine`\), nó sẽ tự động đồng bộ hàng đợi thầm lặng lên backend\. \| Biểu tượng Extension hiện dấu chấm màu cam và số hiển thị \(Ví dụ: `+3`\)\. Phát Toast báo: *"Bạn đang ngoại tuyến\. 3 từ vựng đã được lưu trữ tạm thời và sẽ tự động đồng bộ khi khôi phục kết nối mạng\!"* \|

\| **Trang web ngoài chặn chèn mã HTML lạ do chính sách bảo mật CSP cực đoan** \| Nếu Content Script bị CSP của website ngoài chặn chèn Floating Button vào DOM, hệ thống kích hoạt fallback sử dụng native `chrome.contextMenus` API của trình duyệt\. \| Nút nổi bên cạnh con trỏ bôi đen không hiển thị, nhưng menu chuột phải vẫn hoạt động ổn định giúp người dùng lưu từ mượt mà mà không làm lỗi trang web\. \|

---



## **3\. Danh sách Yêu cầu chi tiết \(Product Backlog / User Stories\)**



Dưới đây là Danh sách Product Backlog chuẩn mực được thiết kế để DEV dễ dàng triển khai và viết mã kiểm thử tự động \(Unit / Integration Test\) theo ngôn ngữ Gherkin\.



```Plain Text
+========================================================================================+
|                                    PRODUCT BACKLOG                                     |
+=========+====================================================================+=========+
| ID      | Tên User Story / Mô tả                                             | Hộp Ưu  |
+=========+====================================================================+=========+
+---------+--------------------------------------------------------------------+---------+
| US-001  | Xem phát âm giọng đọc chuẩn người thật & Fallback thông minh       | P1      |
+---------+--------------------------------------------------------------------+---------+
| US-002  | Đọc kiểm tra phát âm trực tiếp bằng nhận diện giọng nói qua Micro  | P1      |
+---------+--------------------------------------------------------------------+---------+
| US-003  | Chrome Extension bôi đen lưu từ đồng bộ thời gian thực             | P3      |
+=========+====================================================================+=========+
```



---

### **\[ID: US\-001\] Nghe Phát Âm Từ Vựng Chuẩn Giọng Từ Điển**

\* **Mức độ ưu tiên/Độ quan trọng:** P1 \(High \- Must\-have\)

\* **User Story:** 

`As a` Học viên đang luyện nghe\-nói tiếng Anh

`I want to` Click vào biểu tượng loa phát âm bên cạnh mỗi từ vựng tại trang Danh sách từ hoặc Thao tác Flashcard

`So that` Tôi được nghe phát âm chuẩn người thật để luyện cách đọc chuẩn xác\.

\* **Acceptance Criteria \(AC\) \- Chuẩn Gherkin:**

\* **Kịch bản 1: Phát âm giọng đọc thật qua Free Dictionary API**

\* **Given \(Trong bối cảnh\):** Người học mở danh sách từ vựng \`/vocabulary\`\.

\* **When \(Khi hành động\):** Click biểu tượng "Loa phát âm" bên cạnh từ "Obvious"\.

\* **Then \(Thì kết quả\):** Ứng dụng gửi request lấy luồng audio \`\.mp3\` chất lượng cao từ Free Dictionary API và tiến hành phát loa\.

\* **Kịch bản 2: Fallback mượt sang Web Speech API do lỗi mạng**

\* **Given \(Trong bối cảnh\):** Thiết bị mất mạng trực tuyến hoặc Free Dictionary API bị sập \(lỗi 404/500\)\.

\* **When \(Khi hành động\):** Người dùng nhấp nút phát âm từ "Obvious"\.

\* **Then \(Thì kết quả\):** Giao diện tự động khởi chạy Web Speech API tích hợp sẵn trong trình duyệt, sử dụng giọng đọc tiếng Anh mặc định của thiết bị để phát âm, đảm bảo không xảy ra lỗi đứng im\.



### **\[ID: US\-002\] Đọc Kiểm Tra Phát Âm Bằng Nhận Diện Giọng Nói**

\* **Mức độ ưu tiên/Độ quan trọng:** P1 \(High \- Must\-have\)

\* **User Story:** 

`As a` Người học muốn trau dồi khả năng phát âm chuẩn xác

`I want to` Nhấn giữ nút Microphone trên thẻ từ vựng dể đọc to từ đó

`So that` Hệ thống ghi nhận âm thanh, so khớp nội dung và chấm điểm phát âm của tôi đúng hay sai một cách thông minh\.

\* **Acceptance Criteria \(AC\) \- Chuẩn Gherkin:**

\* **Kịch bản 1: Nhấn giữ, đọc chuẩn xác và đạt kiểm định**

\* **Given \(Trong bối cảnh\):** Người học đang kiểm tra từ "Enterprise" và cho phép mở quyền truy cập Microphone của trình duyệt\.

\* **When \(Khi hành động\):** Người dùng nhấn giữ nút Microphone, phát âm to rõ chữ "Enterprise" và thả tay ra\.

\* **Then \(Thì kết quả\):** Web Speech API nhận diện giọng nói, bóc tách chuỗi chữ, thực hiện so khớp không phân biệt hoa thường\. Kết quả trả về tỷ lệ tương đồng đạt $100\\%$, thẻ từ hiển thị viền xanh lá lấp lánh kèm âm thanh "Ting" chúc mừng\.

\* **Kịch bản 2: Phát âm bị lệch chuẩn quá quy định**

\* **Given \(Trong bối cảnh\):** Thẻ từ đang kiểm tra là từ "Adventure"\.

\* **When \(Khi hành động\):** Người dùng nhấn giữ Micro và đọc thành "Advertisement"\.

\* **Then \(Thì kết quả\):** Thuật toán so sánh chuỗi nhận diện độ trùng khớp dưới $75\\%$, hệ thống báo đỏ cùng dòng chữ hiển thị phân tích từ bạn vừa phát âm giúp sửa lỗi\.



### **\[ID: US\-003\] Chrome Extension bôi đen lưu từ đồng bộ thời gian thực**

\* **Mức độ ưu tiên/Độ quan trọng:** P3 \(Low \- Nice\-to\-have\)

\* **User Story:**

`As a` Người học tiếng Anh đang đọc tin tức nước ngoài trên trình duyệt Chrome

`I want to` Bôi đen một từ mới và nhấn nút dịch nhanh hoặc click chuột phải gán trực tiếp vào kho từ vựng LingoFlow

`So that` Tôi có thể lưu lại từ mới ngay lập tức mà không cần chuyển tab hay nhập thủ công vào ứng dụng\.

\* **Acceptance Criteria \(AC\) \- Chuẩn Gherkin:**

\* **Kịch bản 1: Đồng bộ từ vựng bôi đen thành công**

\* **Given \(Trong bối cảnh\):** Người dùng đã cài đặt tiện ích LingoFlow Helper, đã đăng nhập và liên kết tài khoản thành công\.

\* **When \(Khi hành động\):** Bôi đen từ "Prosperous" trên một trang blog bất kỳ, click chuột phải chọn "Gửi tới LingoFlow" \(hoặc nhấp vào popup icon nổi lên\)\.

\* **Then \(Thì kết quả\):** Extension gửi yêu cầu dạng POST kèm Bearer Token đến API \`/api/words\` của backend web, hệ thống ghi nhận từ "Prosperous", dịch nghĩa bằng Free Dictionary API hoặc AI, gán Hộp 1 \(Box 1\), lùi thời gian ôn tập và hiển thị thông báo góc màn hình: *"Đã lưu 'Prosperous' \(Thịnh vượng\) thành công\!"*\.

\* **Kịch bản 2: Đồng bộ thất bại do hết hạn phiên làm việc**

\* **Given \(Trong bối cảnh\):** Token JWT lưu trữ trên Extension đã bị hết hạn hoặc không tồn tại\.

\* **When \(Khi hành động\):** Người dùng thực hiện bôi đen và nhấn lưu từ vựng\.

\* **Then \(Thì kết quả\):** Extension chặn hành động, hiển thị tooltip hoặc pop\-up nhỏ yêu cầu: *"Vui lòng nhấp vào biểu tượng Extension để đăng nhập lại trước khi lưu từ mới\."*



---



## **4\. Lập kế hoạch Sprint Chi tiết \(Sprint Plan\)**



### **SPRINT 1: Phát âm Âm thanh, Micro Nhận Diện Giọng Đọc \& Trắc Nghiệm Quiz Động**

\* **Thời gian thực hiện:** Tuần 1 và Tuần 2 \(14 ngày\)\.

\* **Mục tiêu của Sprint:** Tăng cường khả năng phát âm nghe nói toàn diện cho học viên, tích hợp bộ kiểm dịch giọng đọc, nâng cấp module trắc nghiệm và bảng vinh danh thi đua hàng tuần\.

\* **Danh sách các User Stories cam kết thực hiện:**

1. `US-002` \- Nghe phát âm chuẩn giọng bản xứ nhờ Dictionary API hoặc Fallback nội bộ\.

2. `US-003` \- Kiểm âm phát âm to rõ của học viên bằng cách kết nối thu Microphone và phân tích so khớp chữ\.

\* **Tiêu chí Hoàn thành Sprint \(Definition of Done \- DoD\):**

- Toàn bộ giao diện Micro, Loa audio tương thích hoàn hảo trên các thiết bị di động \(Responsive UI/UX\)\.

- Kiểm thử Microphone có khả năng nhận hóa tốt kể cả khi gặp nhiễu ồn thông qua thuật toán lọc chuỗi thô\.

- Toàn bộ mã nguồn hoàn hảo được triển khai thử chạy thành công trên máy chủ đám mây để PO nghiệm thu\.

### SPRINT 2: Đồng Bộ Hoá \& Trải Nghiệm Tiện Ích Trình Duyệt 

\* **Thời gian thực hiện:** Tuần 3 và Tuần 4 \(14 ngày\)\.

\* **Mục tiêu của Sprint:** Hiện thực hóa giải pháp học từ vựng mọi lúc mọi nơi thông qua Chrome Extension\. Giúp người học bôi đen và đồng bộ hóa từ vựng trực tiếp từ bất kỳ website nào về kho từ vựng của LingoFlow theo thời gian thực\.

\* **Danh sách các User Stories cam kết thực hiện:**

1. `US-003` \- Đồng Bộ Hoá Tiện Ích Trình Duyệt \(Chrome Extension Hub\): Tra từ trực tiếp trên trang web ngoài và lưu về tài khoản\.

\* **Tiêu chí Hoàn thành Sprint \(Definition of Done \- DoD\):**

- Chrome Extension hoạt động mượt mà dựa trên Manifest v3, không có lỗi runtime hoặc memory leak trong tab chrome\.

\* Việc gửi từ từ website ngoài thông qua chuột phải hoặc floating button đồng bộ thành công vào cơ sở dữ liệu \(Cloud Mongo/LocalDB\) trong tối đa **300ms**\.

- Hiển thị cảnh báo hoặc tự động mở popup yêu cầu đăng nhập nếu Session hết hạn khi lưu từ, bảo mật JWT chuẩn 100%\.

- Tài liệu hướng dẫn cài đặt và sử dụng Chrome Extension được viết đầy đủ vào thư mục `/docs`\.

---



