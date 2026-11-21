// PRECHECK chatbot – Vercel Edge Function (api/chat.js). Env vars: GEMINI_API_KEY (bí mật), ALLOW_ORIGIN, GEMINI_MODEL.
export const config = { runtime: 'edge' };
// Keyword retrieval over kb.json: Vietnamese-normalized, IDF-weighted, field-weighted. No dependencies.
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const STOP = new Set('va la gi cho cua co khong nao nhung cac toi minh can vi tu the duoc bi hay mot the nao neu thi do se da voi ve'.split(' '));
const toks = s => norm(s).split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w));
function build(kb) {
  const docs = kb.chunks.map(c => ({ c, title: toks(c.title), body: toks(c.text), id: toks(c.id) }));
  const df = {};
  for (const d of docs) for (const w of new Set(d.body)) df[w] = (df[w] || 0) + 1;
  const N = docs.length;
  for (const d of docs) d.idf = w => Math.log(1 + N / (df[w] || 1));
  return docs;
}
function search(idx, q, k = 5) {
  const qt = [...new Set(toks(q))];
  return idx.map(x => {
    let s = 0;
    for (const w of qt) {
      const idf = x.idf(w);
      if (x.title.includes(w)) s += 4 * idf;
      if (x.id.includes(w)) s += 2 * idf;
      const hits = x.body.filter(b => b === w || (w.length >= 4 && b.startsWith(w))).length;
      s += Math.min(hits, 3) * idf;
    }
    return [s, x.c];
  }).filter(a => a[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, k).map(a => a[1]);
}
const KB = {
 "meta": {
  "period": "10/2021 đến 23/10/2026",
  "updated": "23/10/2026"
 },
 "chunks": [
  {
   "id": "code-9",
   "title": "Mã lỗi FDA 9: Nhiễm Salmonella",
   "text": "Mã 9 (SALMONELLA-9) – Nhiễm Salmonella.\nGiải thích: Sản phẩm bị phát hiện có vi khuẩn Salmonella.\nCăn cứ pháp lý: 402(a)(1), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to contain Salmonella, a poisonous and deleterious substance which may render it injurious to health.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Kiểm tra Salmonella theo lô, nhất là sản phẩm ăn liền hoặc ít xử lý nhiệt; Có bước tiêu diệt vi khuẩn (kill step) được xác nhận; Phòng nhiễm chéo: tách khu sống/chín, vệ sinh dụng cụ và nước; Lưu hồ sơ kiểm nghiệm để trình nhà nhập khẩu\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-11",
   "title": "Mã lỗi FDA 11: Phẩm màu không an toàn / không được phép",
   "text": "Mã 11 (UNSAFE COL-11) – Phẩm màu không an toàn / không được phép.\nGiải thích: Sản phẩm chứa phẩm màu chưa được FDA phê duyệt cho thực phẩm.\nCăn cứ pháp lý: 402(c), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article appears to be, or to bear or contain a color additive which is unsafe within the meaning of Section 721(a).\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Chỉ dùng phẩm màu nằm trong danh mục FDA cho phép; Kiểm tra phẩm màu có trong nguyên liệu, gia vị, bột màu; Không dùng phẩm màu chỉ được phép ở thị trường khác; Yêu cầu nhà cung cấp cung cấp bảng thành phần chi tiết\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-62",
   "title": "Mã lỗi FDA 62: Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa",
   "text": "Mã 62 (NEEDS FCE-62) – Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa.\nGiải thích: Cơ sở chưa đăng ký loại hình này với FDA.\nCăn cứ pháp lý: 402(a)(4), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: It appears the manufacturer is not registered as a low acid canned food or acidified food manufacturer pursuant to 21 CFR 108.25(c)(1) or 108.35(c)(1).\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Đăng ký cơ sở với FDA theo đúng loại hình đồ hộp; Hoàn tất đăng ký trước khi gửi lô đầu tiên\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-64",
   "title": "Mã lỗi FDA 64: Có phẩm màu FD&C Yellow No. 5 nhưng không khai báo",
   "text": "Mã 64 (YELLOW #5-64) – Có phẩm màu FD&C Yellow No. 5 nhưng không khai báo.\nGiải thích: FDA nêu có FD&C Yellow No. 5 nhưng chưa khai báo đúng nhãn theo mã charges. Không có căn cứ từ chính mã này để kết luận màu bị cấm.\nCăn cứ pháp lý: 402(c), 403(m), 801(a)(3); ADULTERATION, MISBRANDING\nNguồn gốc tiếng Anh: The food appears to bear or contain the color additive FD & C Yellow No. 5, which is not declared on the label per 21 CFR 74.705(a)(c) under section 721.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi 'FD&C Yellow No. 5' (hoặc tartrazine) trong danh sách thành phần; Rà soát nhãn mọi sản phẩm có màu vàng/cam\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-75",
   "title": "Mã lỗi FDA 75: Bị coi là thuốc mới chưa phê duyệt",
   "text": "Mã 75 (UNAPPROVED-75) – Bị coi là thuốc mới chưa phê duyệt.\nGiải thích: Sản phẩm bị coi như thuốc vì công bố công dụng chữa hoặc phòng bệnh (hay gặp ở thảo dược, thực phẩm bổ sung).\nCăn cứ pháp lý: 505(a), 801(a)(3); UNAPPROVED NEW DRUG\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to be a new drug within the meaning of Section 201(p) without an approved New Drug Application (NDA).\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Không ghi chữa, ngăn ngừa hoặc điều trị bệnh trên nhãn, website, quảng cáo; Rà soát nội dung kèm theo sản phẩm\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-83",
   "title": "Mã lỗi FDA 83: Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa)",
   "text": "Mã 83 (NO PROCESS-83) – Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa).\nGiải thích: Nhà sản xuất chưa nộp quy trình xử lý nhiệt đã lập cho sản phẩm thuộc nhóm đồ hộp axit thấp hoặc axit hóa.\nCăn cứ pháp lý: 402(a)(4), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that the manufacturer's failure to file a scheduled process demonstrates that the product is not being manufactured under the mandatory provisions of 21 CFR Par\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Xác định sản phẩm có thuộc nhóm đồ hộp axit thấp/axit hóa hay không; Nộp quy trình xử lý cho từng sản phẩm trước khi xuất; Làm việc với chuyên gia quy trình (process authority)\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-218",
   "title": "Mã lỗi FDA 218: Thiếu hoặc sai danh sách thành phần",
   "text": "Mã 218 (LIST INGRE-218) – Thiếu hoặc sai danh sách thành phần.\nGiải thích: Phải liệt kê mọi thành phần bằng tên thông dụng.\nCăn cứ pháp lý: 403(i)(2), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(i)(2) of the FD&C Act in that it is fabricated from two or more ingredients a\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Liệt kê tất cả thành phần theo thứ tự giảm dần khối lượng; Kèm thành phần phụ của nguyên liệu ghép; Dùng tên thông dụng, dễ hiểu với người Mỹ\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-238",
   "title": "Mã lỗi FDA 238: Phụ gia thực phẩm không được phép",
   "text": "Mã 238 (UNSAFE ADD-238) – Phụ gia thực phẩm không được phép.\nGiải thích: Sản phẩm chứa phụ gia chưa được FDA cho phép dùng cho loại thực phẩm đó.\nCăn cứ pháp lý: 402(a)(2)(C)(i), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to bear or contain an unsafe food additive within the meaning of section 409.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Đối chiếu từng phụ gia (chất bảo quản, tạo ngọt, tạo màu...) với danh mục của FDA; Không mặc định phụ gia được phép ở nước khác là được phép ở Mỹ; Kiểm tra phụ gia có sẵn trong nguyên liệu mua vào\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-241",
   "title": "Mã lỗi FDA 241: Dư lượng thuốc bảo vệ thực vật",
   "text": "Mã 241 (PESTICIDE-241) – Dư lượng thuốc bảo vệ thực vật.\nGiải thích: Dư lượng vượt mức cho phép (mức tolerance của EPA) hoặc hoạt chất chưa được phép dùng trên loại cây đó ở Mỹ.\nCăn cứ pháp lý: 402(a)(2)(B), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to bear or contain a pesticide chemical residue, which causes the article to be adulterated within the meaning of section 402(a)(2)(B) of the FD\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Đối chiếu từng hoạt chất với danh mục tolerance của EPA cho đúng cây trồng; Kiểm nghiệm dư lượng trước khi xuất tại phòng lab đủ năng lực; Giữ nhật ký phun thuốc và thời gian cách ly từ vùng trồng; Tránh hoạt chất được phép ở thị trường khác nhưng chưa có tolerance ở Mỹ\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-249",
   "title": "Mã lỗi FDA 249: Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm",
   "text": "Mã 249 (FILTHY-249) – Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm.\nGiải thích: FDA cho rằng sản phẩm có côn trùng, chất bẩn, phân hủy hoặc hư hỏng (thường phát hiện khi kiểm tra cảm quan hoặc lấy mẫu).\nCăn cứ pháp lý: 402(a)(3), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that the article appears to consist in whole or in part of a filthy, putrid, or decomposed substance or be otherwise unfit for food.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Kiểm soát côn trùng/chuột và vệ sinh kho, container; Loại bỏ nguyên liệu hư, ẩm mốc ngay từ đầu vào; Kiểm tra ngoại quan từng lô trước khi đóng container; Bảo quản đúng nhiệt độ/độ ẩm, đóng gói kín\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-251",
   "title": "Mã lỗi FDA 251: Chứa chất độc hại (chất cụ thể nêu riêng từng lô)",
   "text": "Mã 251 (POISONOUS-251) – Chứa chất độc hại (chất cụ thể nêu riêng từng lô).\nGiải thích: FDA xác định sản phẩm có chất độc hại có thể gây hại sức khỏe. Chất cụ thể (kim loại nặng, độc tố nấm mốc...) ghi ở phần 'Contains' mà dữ liệu hiện chưa có.\nCăn cứ pháp lý: 402(a)(1), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to bear or contain a poisonous or deleterious substance which may render the article injurious to health. Contains:\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Xác định mối nguy chính theo từng nhóm hàng (kim loại nặng, aflatoxin, chất cấm...); Kiểm nghiệm nguyên liệu và thành phẩm theo mối nguy đó; Kiểm soát chặt nhà cung cấp nguyên liệu\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-253",
   "title": "Mã lỗi FDA 253: Không đạt tiêu chuẩn định danh của sản phẩm",
   "text": "Mã 253 (STD IDENT-253) – Không đạt tiêu chuẩn định danh của sản phẩm.\nGiải thích: Sản phẩm mang tên của món có tiêu chuẩn định danh nhưng không đáp ứng tiêu chuẩn.\nCăn cứ pháp lý: 403(g)(1), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(g)(1) of the FD&C Act in that the article purports to be or is represented as\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Kiểm tra tên sản phẩm có thuộc nhóm có tiêu chuẩn định danh hay không; Nếu không đạt, đổi tên hoặc điều chỉnh công thức\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-256",
   "title": "Mã lỗi FDA 256: Thông tin bắt buộc không nổi bật / khó đọc",
   "text": "Mã 256 (INCONSPICU-256) – Thông tin bắt buộc không nổi bật / khó đọc.\nGiải thích: Thông tin bắt buộc có trên nhãn nhưng chữ quá nhỏ, độ tương phản kém hoặc bị che.\nCăn cứ pháp lý: 403(f), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(f) of the FD&C Act in that any word, statement, or other information required\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Dùng cỡ chữ đủ lớn và nền tương phản; Không để hình ảnh hoặc tem dán đè lên thông tin; Đặt thông tin ở vị trí dễ thấy\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-260",
   "title": "Mã lỗi FDA 260: Nhãn sai hoặc gây hiểu lầm",
   "text": "Mã 260 (FALSE-260) – Nhãn sai hoặc gây hiểu lầm.\nGiải thích: Thông tin hoặc hình ảnh trên nhãn không đúng với sản phẩm thật.\nCăn cứ pháp lý: 403(a)(1), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(a)(1 ) of the FD&C Act in that the labeling is false or misleading in any par\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Rà soát hình ảnh, tuyên bố nguồn gốc, thành phần, hương vị; Chỉ dùng từ như 'natural' khi có căn cứ; Đảm bảo hình minh họa khớp nội dung bên trong\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-274",
   "title": "Mã lỗi FDA 274: Có phẩm màu nhân tạo nhưng nhãn không ghi",
   "text": "Mã 274 (COLOR LBLG-274) – Có phẩm màu nhân tạo nhưng nhãn không ghi.\nGiải thích: Nhãn phải nêu rõ sản phẩm có phẩm màu nhân tạo.\nCăn cứ pháp lý: 403(k), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article appears to contain an artificial coloring and it fails to bear labeling stating that fact.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi 'Artificial Color' hoặc tên phẩm màu trong danh sách thành phần; Rà soát nhãn sản phẩm có màu\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-276",
   "title": "Mã lỗi FDA 276: Có chất bảo quản hóa học nhưng nhãn không ghi",
   "text": "Mã 276 (PRESRV LBL-276) – Có chất bảo quản hóa học nhưng nhãn không ghi.\nGiải thích: Nhãn phải ghi tên chất bảo quản và chức năng.\nCăn cứ pháp lý: 403(k), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to contain a chemical preservative and it fails to bear labeling stating that fact including its function.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi tên chất bảo quản kèm chức năng trong danh sách thành phần; Kiểm tra chất bảo quản có sẵn trong nguyên liệu\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-295",
   "title": "Mã lỗi FDA 295: Nhiễm Listeria monocytogenes",
   "text": "Mã 295 (LISTERIA-295) – Nhiễm Listeria monocytogenes.\nGiải thích: Sản phẩm bị phát hiện có vi khuẩn Listeria, nguy cơ cao với sản phẩm ăn liền và bảo quản lạnh.\nCăn cứ pháp lý: 402(a)(1), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3), in that the article appears to contain Listeria monocytogenes, a poisonous and deleterious substance, which may render it injurious to health.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Giám sát vi sinh môi trường (sàn, thiết bị, băng chuyền); Kiểm soát vệ sinh và nhiệt độ lạnh liên tục; Kiểm nghiệm Listeria với sản phẩm ăn liền; Có kế hoạch xử lý khi phát hiện dương tính\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-306",
   "title": "Mã lỗi FDA 306: Có thể bị nhiễm bẩn do điều kiện mất vệ sinh",
   "text": "Mã 306 (INSANITARY-306) – Có thể bị nhiễm bẩn do điều kiện mất vệ sinh.\nGiải thích: Sản phẩm có nguy cơ nhiễm bẩn vì điều kiện chuẩn bị, đóng gói hoặc lưu giữ.\nCăn cứ pháp lý: 402(a)(4), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to have been prepared, packed, or held under insanitary conditions whereby it may have become contaminated with filth, or whereby it may have be\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Vệ sinh kho, phương tiện vận chuyển và container; Tách sản phẩm khỏi nguồn gây nhiễm; Lưu hồ sơ vệ sinh\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-308",
   "title": "Mã lỗi FDA 308: Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh",
   "text": "Mã 308 (MFR INSAN-308) – Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh.\nGiải thích: Theo hồ sơ FDA, hàng hóa có dấu hiệu được chế biến/sản xuất/đóng gói trong điều kiện mất vệ sinh; cần đối chiếu kết quả kiểm tra cơ sở và yêu cầu áp dụng.\nCăn cứ pháp lý: 801(a)(1); INSANITARY MANUFACTURING, PROCESSING OR PACKING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to section 801(a)(1) in that the article appears to have been manufactured, processed, or packed under insanitary conditions.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Tuân thủ GMP theo quy định thực phẩm của Mỹ; Tự đánh giá và khắc phục tồn tại sau các đợt kiểm tra trước; Đảm bảo đăng ký cơ sở với FDA còn hiệu lực; Có kế hoạch kiểm soát phòng ngừa\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-320",
   "title": "Mã lỗi FDA 320: Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối",
   "text": "Mã 320 (LACKS FIRM-320) – Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối.\nGiải thích: Nhãn phải ghi nơi kinh doanh của đơn vị chịu trách nhiệm.\nCăn cứ pháp lý: 403(e)(1), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(e)(1) of the FD&C Act in that the food is in package form and the label fails\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi tên và địa chỉ đầy đủ của nhà sản xuất, đóng gói hoặc phân phối; Thống nhất nội dung với nhà nhập khẩu\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-321",
   "title": "Mã lỗi FDA 321: Thiếu hoặc sai khối lượng tịnh",
   "text": "Mã 321 (LACKS N/C-321) – Thiếu hoặc sai khối lượng tịnh.\nGiải thích: Nhãn phải ghi chính xác lượng chứa theo khối lượng hoặc thể tích.\nCăn cứ pháp lý: 403(e)(2), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(e)(2) of the FD&C Act in that the food is in package form and the label fails\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi khối lượng tịnh đúng vị trí quy định trên mặt chính của nhãn; Dùng đơn vị Mỹ kèm đơn vị mét; Kiểm tra số liệu khớp thực tế\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-324",
   "title": "Mã lỗi FDA 324: Thông tin bắt buộc không có tiếng Anh",
   "text": "Mã 324 (NO ENGLISH-324) – Thông tin bắt buộc không có tiếng Anh.\nGiải thích: Thông tin bắt buộc trên nhãn phải bằng tiếng Anh và đặt nổi bật.\nCăn cứ pháp lý: 403(f), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(f) of the FD&C Act in that any word, statement, or other information required\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Dịch đầy đủ nhãn sang tiếng Anh: tên sản phẩm, thành phần, khối lượng, nhà sản xuất, dinh dưỡng, dị ứng; Dùng cỡ chữ đủ lớn, dễ đọc; Nhờ người bản ngữ kiểm tra\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-328",
   "title": "Mã lỗi FDA 328: Thiếu tên thông dụng của sản phẩm",
   "text": "Mã 328 (USUAL NAME-328) – Thiếu tên thông dụng của sản phẩm.\nGiải thích: Mặt chính của nhãn phải có tên gọi của thực phẩm.\nCăn cứ pháp lý: 403(i)(1), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(i)(1) of the FD&C Act in that the label fails to bear the common or usual nam\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi tên thực phẩm rõ ràng, đúng thông dụng, ở mặt chính; Tránh tên thương mại không mô tả được sản phẩm\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-329",
   "title": "Mã lỗi FDA 329: Đồ uống chứa nước ép không ghi phần trăm nước ép",
   "text": "Mã 329 (JUICE %-329) – Đồ uống chứa nước ép không ghi phần trăm nước ép.\nGiải thích: Nhãn phải ghi tỷ lệ phần trăm nước ép.\nCăn cứ pháp lý: 403(i)(2), 801(a)(3); MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(i)(2) of the FD&C Act in that the food purports to be a beverage containing v\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Ghi tỷ lệ nước ép đúng cách và vị trí; Kiểm tra công thức để tính đúng tỷ lệ\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-473",
   "title": "Mã lỗi FDA 473: Vi phạm luật đóng gói và ghi nhãn (FPLA)",
   "text": "Mã 473 (LABELING-473) – Vi phạm luật đóng gói và ghi nhãn (FPLA).\nGiải thích: Vị trí, hình thức hoặc nội dung khai báo khối lượng chưa đúng.\nCăn cứ pháp lý: Section 4(a); 801(a)(3) Misbranding\nNguồn gốc tiếng Anh: The article appears in violation of FPLA because of its placement, form and/or contents statement.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Rà soát vị trí và cách trình bày khối lượng tịnh; Đối chiếu với mã 321\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-482",
   "title": "Mã lỗi FDA 482: Thiếu bảng thông tin dinh dưỡng (Nutrition Facts)",
   "text": "Mã 482 (NUTRIT LBL-482) – Thiếu bảng thông tin dinh dưỡng (Nutrition Facts).\nGiải thích: Nhãn không có thông tin dinh dưỡng theo mẫu của Mỹ.\nCăn cứ pháp lý: 403(q); 801(a)(3); Misbranding\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to be misbranded in that the label or labeling fails to bear the required nutrition information.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Thêm Nutrition Facts đúng định dạng và khẩu phần theo quy định của FDA; Dùng đơn vị Mỹ; Chỉ dùng trường hợp miễn trừ khi đủ điều kiện và đã xác nhận\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-488",
   "title": "Mã lỗi FDA 488: Công bố dinh dưỡng/sức khỏe chưa được phép",
   "text": "Mã 488 (HEALTH C-488) – Công bố dinh dưỡng/sức khỏe chưa được phép.\nGiải thích: Nhãn có tuyên bố về dinh dưỡng hoặc sức khỏe không được phép.\nCăn cứ pháp lý: 801(a)(3); 403(r)(1)(A)/(B) misbranding\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to be misbranded in that the label or labeling bears an unauthorized nutrient content/health claim.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Bỏ hoặc chỉnh các tuyên bố như 'tốt cho tim', 'giàu...' nếu chưa đủ điều kiện; Đối chiếu từng tuyên bố với quy định của FDA\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-2360",
   "title": "Mã lỗi FDA 2360: Chứa histamine (ngộ độc scombroid)",
   "text": "Mã 2360 (HISTAMINE-2360) – Chứa histamine (ngộ độc scombroid).\nGiải thích: Histamine sinh ra khi cá (cá ngừ, cá thu...) bị để nhiệt độ cao quá lâu; không bị phá hủy bằng nấu.\nCăn cứ pháp lý: 402(a)(1), 801(a)(3); Adulteration\nNguồn gốc tiếng Anh: The article appears to bear or contain histamine, a poisonous and deleterious substance in such quantity as ordinarily renders it injurious to health.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Làm lạnh nhanh và giữ lạnh liên tục từ lúc thu mua/đánh bắt; Ghi chép thời gian và nhiệt độ từng lô; Kiểm nghiệm histamine với cá nhóm nguy cơ; Áp dụng HACCP thủy sản\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-2580",
   "title": "Mã lỗi FDA 2580: Vi phạm quy định HACCP thủy sản",
   "text": "Mã 2580 (MFRHACCP-2580) – Vi phạm quy định HACCP thủy sản.\nGiải thích: Chế biến thủy sản không tuân thủ yêu cầu phân tích mối nguy, kế hoạch HACCP và hành động khắc phục.\nCăn cứ pháp lý: 402(a)(4), 801(a)(3)\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the Act in that it appears to have been prepared, packed or held under insanitary conditions whereby it may have been rendered injurious to health in that it ap\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Có phân tích mối nguy và kế hoạch HACCP bằng văn bản cho từng sản phẩm; Có người được đào tạo HACCP thủy sản; Lưu hồ sơ giám sát, hành động khắc phục và thẩm tra\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-2860",
   "title": "Mã lỗi FDA 2860: Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất)",
   "text": "Mã 2860 (VETDRUGRES-2860) – Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất).\nGiải thích: Sản phẩm chứa thuốc thú y (kháng sinh, thuốc xử lý ao nuôi) chưa được phép hoặc vượt mức, thường gặp ở thủy sản nuôi.\nCăn cứ pháp lý: 402(a)(2)(C)(ii); 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it is a food that appears to bear or contain a new animal drug (or conversion product thereof) that is unsafe within the meaning of Section 512.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Kiểm soát thuốc/kháng sinh dùng trong ao nuôi và thức ăn; Giữ hồ sơ nuôi trồng, thời gian ngừng thuốc trước thu hoạch; Kiểm nghiệm lô với các nhóm thuốc FDA thường kiểm tra; Cập nhật danh sách thuốc bị kiểm soát hiện hành với chuyên gia\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3220",
   "title": "Mã lỗi FDA 3220: Dư lượng nitrofuran (kháng sinh cấm)",
   "text": "Mã 3220 (NITROFURAN-3220) – Dư lượng nitrofuran (kháng sinh cấm).\nGiải thích: Nitrofuran không được phép dùng cho động vật làm thực phẩm; FDA coi là phụ gia không an toàn.\nCăn cứ pháp lý: 402(a)(2)(C)(i), 801(a)(3); Adulteration\nNguồn gốc tiếng Anh: The article is subject to refusal of admission, pursuant to Section 801(a)(3) in that it appears to bear or contain a food additive, namely, nitrofurans, that is unsafe within the meaning of section 409.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Cấm dùng nitrofuran trong nuôi trồng và thức ăn; Yêu cầu cam kết và chứng nhận từ con giống, ao nuôi, thức ăn; Kiểm nghiệm chất chuyển hóa nitrofuran theo lô\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3300",
   "title": "Mã lỗi FDA 3300: Không khai báo đủ chất gây dị ứng chính",
   "text": "Mã 3300 (ALLERGEN-3300) – Không khai báo đủ chất gây dị ứng chính.\nGiải thích: Nhãn phải nêu các nhóm gây dị ứng chính của Mỹ có trong sản phẩm.\nCăn cứ pháp lý: 403(w) 801(a)(3); Misbranding\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to be misbranded within the meaning of section 403(w) in that it appears that the label fails to declare all major food allergens present in the\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Khai báo 9 nhóm dị ứng chính: sữa, trứng, cá, giáp xác, hạt cây, đậu phộng, lúa mì, đậu nành, mè; Kiểm tra cả thành phần phụ và nguy cơ nhiễm chéo; Rà soát lại công thức khi đổi nhà cung cấp\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3421",
   "title": "Mã lỗi FDA 3421: Chứa melamine",
   "text": "Mã 3421 (MELAMINE-3421) – Chứa melamine.\nGiải thích: Melamine bị coi là phụ gia không an toàn (thường liên quan sản phẩm sữa, protein).\nCăn cứ pháp lý: 402(a)(2)(C)(i), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to section 801(a)(3) in that it appears to bear or contain a food additive, namely melamine and/or a melamine analog, that is unsafe within the meaning of section 409.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Kiểm nghiệm melamine với nguyên liệu protein/sữa; Xác minh nguồn nguyên liệu và chứng nhận nhà cung cấp\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3422",
   "title": "Mã lỗi FDA 3422: Không phù hợp làm thực phẩm",
   "text": "Mã 3422 (UNFIT4FOOD-3422) – Không phù hợp làm thực phẩm.\nGiải thích: FDA đánh giá sản phẩm không phù hợp làm thực phẩm (hư hỏng, biến chất).\nCăn cứ pháp lý: 402(a)(3), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to section 801(a)(3) in that it appears to be unfit for food.\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Kiểm tra cảm quan và hạn dùng; Kiểm soát điều kiện vận chuyển, bảo quản\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3821",
   "title": "Mã lỗi FDA 3821: Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại",
   "text": "Mã 3821 (MFR INJ-3821) – Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại.\nGiải thích: Tương tự mã 308, kèm nhận định có thể gây hại sức khỏe.\nCăn cứ pháp lý: 402(a)(4),801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the Federal Food, Drug, and Cosmetic Act (the Act) in that such article appears to have been prepared, packed, or held under insanitary conditions whereby it ma\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Làm như mã 308; Thanh tra nội bộ định kỳ và lưu hồ sơ khắc phục\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3846",
   "title": "Mã lỗi FDA 3846: Cơ sở nước ngoài từ chối cho FDA thanh tra",
   "text": "Mã 3846 (807REFUSAL-3846) – Cơ sở nước ngoài từ chối cho FDA thanh tra.\nGiải thích: FDA không thể thanh tra hoặc không liên lạc được với cơ sở.\nCăn cứ pháp lý: 807(b)\nNguồn gốc tiếng Anh: The food is subject to refusal of admission pursuant to Section 807 in that the foreign factory, warehouse, or other establishment of which the owner, operator, or agent in charge, or the government of the foreign country, refuses to permit\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Cho phép thanh tra khi FDA yêu cầu; Có đại diện tại Mỹ (US Agent) liên lạc được và thông tin đăng ký luôn cập nhật\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3865",
   "title": "Mã lỗi FDA 3865: Thông tin bắt buộc thiếu tính nổi bật / dễ đọc (không kết luận liên quan màu)",
   "text": "Mã 3865 (COLORLABEL-3865) – Thông tin bắt buộc thiếu tính nổi bật / dễ đọc (không kết luận liên quan màu).\nGiải thích: Theo mô tả tiếng Anh, sản phẩm có dấu hiệu thông tin nhãn bắt buộc không đủ nổi bật/khó đọc theo §403(f). Không đủ căn cứ coi là “nhãn màu”.\nCăn cứ pháp lý: 403(f);801(a)(3);MISBRANDING\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) of the FD&C Act in that it appears to be misbranded within the meaning of Section 403(f) of the FD&C Act in that any word, statement, or other information required\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Làm như mã 256; Đối chiếu cột mô tả chính thức để xác nhận trường hợp\nMức ưu tiên: Trung bình",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3878",
   "title": "Mã lỗi FDA 3878: Chứa chất độc hại thường gây hại cho sức khỏe",
   "text": "Mã 3878 (POISONORD-3878) – Chứa chất độc hại thường gây hại cho sức khỏe.\nGiải thích: Gần giống mã 251 nhưng dùng mức đánh giá 'thông thường gây hại'. Chất cụ thể ghi ở phần 'Contains'.\nCăn cứ pháp lý: 402(a)(1), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to contain a poisonous or deleterious substance which would ordinarily render the article injurious to health. Contains:\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Làm tương tự mã 251; Đối chiếu kết quả kiểm nghiệm với giới hạn của FDA cho từng chất\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3886",
   "title": "Mã lỗi FDA 3886: Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP)",
   "text": "Mã 3886 (FSVP VIO-3886) – Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP).\nGiải thích: Nghĩa vụ chính thuộc nhà nhập khẩu Mỹ, nhưng lô hàng của bạn bị giữ lại nếu họ không tuân thủ.\nCăn cứ pháp lý: 805, 801(a)(3); FOREIGN SUPPLIER VERIFICATION PROGRAM\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to section 801(a)(3) of the Federal Food, Drug, and Cosmetic Act (FD&C Act) in that it appears that the importer (as defined in section 805 of the FD&C Act) is in violation of section \nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Trao đổi với nhà nhập khẩu về FSVP ngay từ khi ký hợp đồng; Chuẩn bị sẵn hồ sơ: kế hoạch an toàn thực phẩm, kết quả kiểm nghiệm, chứng nhận, báo cáo đánh giá; Phản hồi nhanh các yêu cầu cung cấp thông tin\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "code-3898",
   "title": "Mã lỗi FDA 3898: Mất vệ sinh do kiểm soát quy trình không đầy đủ",
   "text": "Mã 3898 (INADPRCCTL-3898) – Mất vệ sinh do kiểm soát quy trình không đầy đủ.\nGiải thích: Cơ sở không có hoặc không thực hiện đủ kiểm soát quy trình.\nCăn cứ pháp lý: 402(a)(4), 801(a)(3); ADULTERATION\nNguồn gốc tiếng Anh: The article is subject to refusal of admission pursuant to Section 801(a)(3) in that it appears to have been prepared, packed, or held under insanitary conditions whereby it may have become contaminated with filth, or whereby it may have be\nHành động gợi ý (bản nháp, chưa chuyên gia duyệt): Xây dựng và thực hiện kiểm soát quy trình (điểm kiểm soát, giới hạn, giám sát); Lưu hồ sơ giám sát và hành động khắc phục\nMức ưu tiên: Cao",
   "source": "FDA Import Refusals – thư viện mã lỗi trong data.js"
  },
  {
   "id": "group-MAHI-MAHI",
   "title": "Nhóm sản phẩm FDA: Cá nục heo (mahi-mahi)",
   "text": "Nhóm FDA: MAHI MAHI\nTên tiếng Việt: Cá nục heo (mahi-mahi)\nTừ khóa: cá nục heo, mahi mahi, cá mahi\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 257; Việt Nam: 95\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 90%; Chứa histamine (ngộ độc scombroid): 10%; Chứa chất độc hại thường gây hại cho sức khỏe: 8%; Nhiễm Salmonella: 7%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 3%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 85%; Nhiễm Salmonella: 19%; Chứa chất độc hại thường gây hại cho sức khỏe: 7%; Chứa histamine (ngộ độc scombroid): 3%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TUNA-ALBACORE-YELLOWFIN-BLUEFIN-SKIP",
   "title": "Nhóm sản phẩm FDA: Cá ngừ (vây dài, vây vàng, vây xanh, sọc dưa...)",
   "text": "Nhóm FDA: TUNA (ALBACORE, YELLOWFIN, BLUEFIN, SKIPJACK, ETC.)\nTên tiếng Việt: Cá ngừ (vây dài, vây vàng, vây xanh, sọc dưa...)\nTừ khóa: cá ngừ, cá ngừ đại dương, cá ngừ vây vàng, cá ngừ sọc dưa, tuna\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 637; Việt Nam: 77\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 46%; Chứa histamine (ngộ độc scombroid): 29%; Nhiễm Salmonella: 23%; Mất vệ sinh do kiểm soát quy trình không đầy đủ: 12%; Chứa chất độc hại thường gây hại cho sức khỏe: 5%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 75%; Chứa histamine (ngộ độc scombroid): 19%; Nhiễm Salmonella: 12%; Nhiễm Listeria monocytogenes: 3%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-JAM-JELLY-PRESERVES-MARMALA",
   "title": "Nhóm sản phẩm FDA: Me: mứt, thạch, ô mai, ngâm đường",
   "text": "Nhóm FDA: TAMARIND, JAM, JELLY, PRESERVES, MARMALADE, BUTTER OR CANDIED\nTên tiếng Việt: Me: mứt, thạch, ô mai, ngâm đường\nTừ khóa: mứt me, ô mai me, me ngâm đường, mứt trái cây\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 159; Việt Nam: 67\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 97%; Phẩm màu không an toàn / không được phép: 2%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 1%; 3400: 1%; Thiếu hoặc sai danh sách thành phần: 1%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 99%; Phẩm màu không an toàn / không được phép: 1%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FISH-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Cá, loại khác (chưa phân loại)",
   "text": "Nhóm FDA: FISH, N.E.C.\nTên tiếng Việt: Cá, loại khác (chưa phân loại)\nTừ khóa: cá, phi lê cá, cá đông lạnh, cá tươi\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 487; Việt Nam: 65\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 32%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 28%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 21%; Thiếu tên thông dụng của sản phẩm: 8%; Thiếu hoặc sai khối lượng tịnh: 8%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 42%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 29%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 25%; Thiếu hoặc sai khối lượng tịnh: 11%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 8%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CASHEW-SHELLED",
   "title": "Nhóm sản phẩm FDA: Hạt điều đã bóc vỏ",
   "text": "Nhóm FDA: CASHEW, SHELLED\nTên tiếng Việt: Hạt điều đã bóc vỏ\nTừ khóa: hạt điều, điều nhân, hạt điều rang\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 81; Việt Nam: 63\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 47%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 31%; Nhiễm Salmonella: 10%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 4%; Thông tin bắt buộc không có tiếng Anh: 2%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 60%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 33%; Nhiễm Salmonella: 5%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 2%; Thông tin bắt buộc không có tiếng Anh: 2%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SHRIMP-AND-PRAWNS-AQUACULTURE-HARVESTED",
   "title": "Nhóm sản phẩm FDA: Tôm nuôi",
   "text": "Nhóm FDA: SHRIMP AND PRAWNS, AQUACULTURE HARVESTED FISHERY/SEAFOOD PRODUCTS\nTên tiếng Việt: Tôm nuôi\nTừ khóa: tôm, tôm thẻ, tôm sú, tôm nuôi, tôm đông lạnh\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 916; Việt Nam: 51\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 33%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 22%; Nhiễm Salmonella: 22%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 21%; Dư lượng nitrofuran (kháng sinh cấm): 17%\nLỗi thường gặp (Việt Nam): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 51%; Dư lượng nitrofuran (kháng sinh cấm): 33%; Nhiễm Salmonella: 12%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 8%; 3885: 8%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GROUPERS",
   "title": "Nhóm sản phẩm FDA: Cá mú (cá song)",
   "text": "Nhóm FDA: GROUPERS\nTên tiếng Việt: Cá mú (cá song)\nTừ khóa: cá mú, cá song\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 172; Việt Nam: 35\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 49%; Nhiễm Salmonella: 31%; Chứa histamine (ngộ độc scombroid): 12%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 5%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 2%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 54%; Chứa histamine (ngộ độc scombroid): 23%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 23%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-AQUACULTURE-HARVESTED-FISHERY-SEAFOOD-PR",
   "title": "Nhóm sản phẩm FDA: Thủy sản nuôi trồng, loại khác",
   "text": "Nhóm FDA: AQUACULTURE HARVESTED FISHERY/SEAFOOD PRODUCTS, N.E.C.,\nTên tiếng Việt: Thủy sản nuôi trồng, loại khác\nTừ khóa: thủy sản nuôi, hải sản nuôi, cá nuôi\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 44; Việt Nam: 31\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 86%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 7%; Vi phạm quy định HACCP thủy sản: 5%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 2%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 2%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 97%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 3%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 3%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Me sấy khô hoặc dạng nhão",
   "text": "Nhóm FDA: TAMARIND, DRIED OR PASTE\nTên tiếng Việt: Me sấy khô hoặc dạng nhão\nTừ khóa: me sấy, me nhão, cơm me\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 440; Việt Nam: 29\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 98%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 2%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 0%; Thiếu hoặc sai khối lượng tịnh: 0%; Thông tin bắt buộc không có tiếng Anh: 0%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 97%; 312: 3%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FISH-MAW-FISHERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Bóng cá và thủy sản chế biến khác",
   "text": "Nhóm FDA: FISH MAW, FISHERY PRODUCTS, N.E.C.\nTên tiếng Việt: Bóng cá và thủy sản chế biến khác\nTừ khóa: bóng cá, bong bóng cá, thủy sản chế biến\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 102; Việt Nam: 27\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%; Không đạt tiêu chuẩn định danh của sản phẩm: 1%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%; Không đạt tiêu chuẩn định danh của sản phẩm: 4%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LEAF-STEM-VEGETABLES-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Rau lá và rau thân, loại khác",
   "text": "Nhóm FDA: LEAF & STEM VEGETABLES, N.E.C.\nTên tiếng Việt: Rau lá và rau thân, loại khác\nTừ khóa: rau lá, rau xanh, rau ăn lá, rau thân\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 150; Việt Nam: 25\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 49%; Nhiễm Salmonella: 19%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 15%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 5%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 4%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 68%; Nhiễm Salmonella: 16%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 8%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 8%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SHRIMP-PRAWNS-BREADED",
   "title": "Nhóm sản phẩm FDA: Tôm tẩm bột chiên xù",
   "text": "Nhóm FDA: SHRIMP & PRAWNS, BREADED\nTên tiếng Việt: Tôm tẩm bột chiên xù\nTừ khóa: tôm tẩm bột, tôm chiên xù, tôm bread\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 112; Việt Nam: 21\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 45%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 38%; Dư lượng nitrofuran (kháng sinh cấm): 25%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 21%; Phụ gia thực phẩm không được phép: 16%\nLỗi thường gặp (Việt Nam): Dư lượng nitrofuran (kháng sinh cấm): 71%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 62%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 14%; Nhiễm Salmonella: 10%; 2900: 10%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-NOODLES-INSTANT",
   "title": "Nhóm sản phẩm FDA: Mì ăn liền",
   "text": "Nhóm FDA: NOODLES, INSTANT\nTên tiếng Việt: Mì ăn liền\nTừ khóa: mì gói, mì ăn liền, mì tôm\nNgành: Mì, bún và ngũ cốc chế biến\nSố dòng từ chối toàn cầu: 201; Việt Nam: 20\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 33%; Thiếu hoặc sai danh sách thành phần: 28%; Thông tin bắt buộc không có tiếng Anh: 26%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 24%; Thiếu hoặc sai khối lượng tịnh: 21%\nLỗi thường gặp (Việt Nam): Thông tin bắt buộc không có tiếng Anh: 100%; Thiếu hoặc sai khối lượng tịnh: 40%; Thiếu tên thông dụng của sản phẩm: 20%; Phẩm màu không an toàn / không được phép: 15%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 15%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MUSHROOM-STRAW-WHOLE-BUTTON-FUNGI-",
   "title": "Nhóm sản phẩm FDA: Nấm rơm nguyên cây",
   "text": "Nhóm FDA: MUSHROOM, STRAW, WHOLE (BUTTON) (FUNGI)\nTên tiếng Việt: Nấm rơm nguyên cây\nTừ khóa: nấm rơm, nấm rơm đóng hộp\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 19; Việt Nam: 18\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 79%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 16%; Nhiễm Salmonella: 5%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 78%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 17%; Nhiễm Salmonella: 6%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BETEL-NUT-SHELLED",
   "title": "Nhóm sản phẩm FDA: Hạt cau đã bóc vỏ",
   "text": "Nhóm FDA: BETEL NUT, SHELLED\nTên tiếng Việt: Hạt cau đã bóc vỏ\nTừ khóa: cau, hạt cau, quả cau\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 272; Việt Nam: 17\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại thường gây hại cho sức khỏe: 79%; Phụ gia thực phẩm không được phép: 31%; 2461: 14%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 12%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 4%\nLỗi thường gặp (Việt Nam): Chứa chất độc hại thường gây hại cho sức khỏe: 71%; Phụ gia thực phẩm không được phép: 47%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 29%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CINNAMON-CASSIA-GROUND-CRACKED-SPICE",
   "title": "Nhóm sản phẩm FDA: Quế dạng bột hoặc nghiền",
   "text": "Nhóm FDA: CINNAMON, CASSIA, GROUND, CRACKED (SPICE)\nTên tiếng Việt: Quế dạng bột hoặc nghiền\nTừ khóa: quế, bột quế, quế nghiền, cassia\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 91; Việt Nam: 17\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 38%; 3400: 14%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 11%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 11%; Bị coi là thuốc mới chưa phê duyệt: 10%\nLỗi thường gặp (Việt Nam): 3400: 47%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 35%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 18%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 6%; Phụ gia thực phẩm không được phép: 6%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TILAPIA-AQUACULTURE-HARVESTED-FISHERY-S",
   "title": "Nhóm sản phẩm FDA: Cá rô phi nuôi",
   "text": "Nhóm FDA: TILAPIA, AQUACULTURE HARVESTED FISHERY/SEAFOOD PRODUCTS\nTên tiếng Việt: Cá rô phi nuôi\nTừ khóa: cá rô phi, cá điêu hồng, cá nuôi\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 82; Việt Nam: 17\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 41%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 24%; Dư lượng thuốc bảo vệ thực vật: 24%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 7%; Dư lượng nitrofuran (kháng sinh cấm): 4%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 82%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 18%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BETEL-NUT-IN-SHELL",
   "title": "Nhóm sản phẩm FDA: Hạt cau còn vỏ",
   "text": "Nhóm FDA: BETEL NUT, IN SHELL\nTên tiếng Việt: Hạt cau còn vỏ\nTừ khóa: cau, quả cau, cau tươi\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 67; Việt Nam: 17\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại thường gây hại cho sức khỏe: 69%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 25%; Phụ gia thực phẩm không được phép: 18%\nLỗi thường gặp (Việt Nam): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 53%; Chứa chất độc hại thường gây hại cho sức khỏe: 35%; Phụ gia thực phẩm không được phép: 29%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FROGS-AQUACULTURE-HARVESTED-FISHERY-SEA",
   "title": "Nhóm sản phẩm FDA: Ếch nuôi",
   "text": "Nhóm FDA: FROGS, AQUACULTURE HARVESTED FISHERY/SEAFOOD PRODUCTS\nTên tiếng Việt: Ếch nuôi\nTừ khóa: ếch, thịt ếch, ếch đông lạnh\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 19; Việt Nam: 14\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 84%; Dư lượng nitrofuran (kháng sinh cấm): 84%\nLỗi thường gặp (Việt Nam): Dư lượng nitrofuran (kháng sinh cấm): 100%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 86%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SCAD",
   "title": "Nhóm sản phẩm FDA: Cá nục / cá sòng",
   "text": "Nhóm FDA: SCAD\nTên tiếng Việt: Cá nục / cá sòng\nTừ khóa: cá nục, cá sòng\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 17; Việt Nam: 14\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 47%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 41%; Vi phạm quy định HACCP thủy sản: 41%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 6%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 6%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 57%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 50%; Vi phạm quy định HACCP thủy sản: 43%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 7%; 315: 7%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FISH-SAUCE-FISHERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Nước mắm",
   "text": "Nhóm FDA: FISH SAUCE, FISHERY PRODUCTS, N.E.C.\nTên tiếng Việt: Nước mắm\nTừ khóa: nước mắm, mắm cá, fish sauce\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 45; Việt Nam: 12\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 31%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 16%; Vi phạm quy định HACCP thủy sản: 16%; Mất vệ sinh do kiểm soát quy trình không đầy đủ: 11%; 48: 9%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 83%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-GRAIN-SNACK-WHOLE-SPLIT-FRIED-O",
   "title": "Nhóm sản phẩm FDA: Snack từ hạt gạo chiên (rán dầu)",
   "text": "Nhóm FDA: RICE GRAIN SNACK (WHOLE, SPLIT), FRIED/OIL COOKED\nTên tiếng Việt: Snack từ hạt gạo chiên (rán dầu)\nTừ khóa: snack gạo, bánh gạo chiên, gạo chiên\nNgành: Snack\nSố dòng từ chối toàn cầu: 21; Việt Nam: 11\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Có phẩm màu nhân tạo nhưng nhãn không ghi: 38%; Phẩm màu không an toàn / không được phép: 33%; Chứa melamine: 24%; Thông tin bắt buộc không có tiếng Anh: 19%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 14%\nLỗi thường gặp (Việt Nam): Có phẩm màu nhân tạo nhưng nhãn không ghi: 64%; Phẩm màu không an toàn / không được phép: 45%; Thông tin bắt buộc không có tiếng Anh: 36%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 9%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GOBY",
   "title": "Nhóm sản phẩm FDA: Cá bống",
   "text": "Nhóm FDA: GOBY\nTên tiếng Việt: Cá bống\nTừ khóa: cá bống\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 16; Việt Nam: 11\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 38%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 19%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 19%; Vi phạm quy định HACCP thủy sản: 19%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 12%\nLỗi thường gặp (Việt Nam): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 27%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 27%; Vi phạm quy định HACCP thủy sản: 27%; Nhiễm Salmonella: 18%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 18%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SNAPPER-RED-GRAY-MALABAR-ETC-",
   "title": "Nhóm sản phẩm FDA: Cá hồng (các loại)",
   "text": "Nhóm FDA: SNAPPER (RED, GRAY, MALABAR, ETC.)\nTên tiếng Việt: Cá hồng (các loại)\nTừ khóa: cá hồng, cá hanh, snapper\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 216; Việt Nam: 10\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 82%; Nhiễm Salmonella: 14%; Thông tin bắt buộc không có tiếng Anh: 2%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 2%; 319: 1%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 80%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 20%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-JUICE-MILK-CREME-DRINK-OR-N",
   "title": "Nhóm sản phẩm FDA: Nước me và đồ uống từ trái cây nhiệt đới",
   "text": "Nhóm FDA: TAMARIND, JUICE, MILK, CREME, DRINK OR NECTAR, SUB/TROPICAL FRUIT\nTên tiếng Việt: Nước me và đồ uống từ trái cây nhiệt đới\nTừ khóa: nước me, nước ép trái cây nhiệt đới, nước giải khát trái cây\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 84; Việt Nam: 10\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 79%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 25%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 2%; Phẩm màu không an toàn / không được phép: 1%; Thiếu hoặc sai khối lượng tịnh: 1%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-SUBTROPICAL-AND-TROPICAL-FRUIT",
   "title": "Nhóm sản phẩm FDA: Me nghiền (puree)",
   "text": "Nhóm FDA: TAMARIND (SUBTROPICAL AND TROPICAL FRUIT PUREES)\nTên tiếng Việt: Me nghiền (puree)\nTừ khóa: me nghiền, puree me, cốt me\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 76; Việt Nam: 10\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 97%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 1%; Thông tin bắt buộc không có tiếng Anh: 1%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PEPPER-HOT-N-E-C-FRUIT-USED-AS-VEGET",
   "title": "Nhóm sản phẩm FDA: Ớt cay tươi (dùng như rau)",
   "text": "Nhóm FDA: PEPPER, HOT, N.E.C. (FRUIT USED AS VEGETABLE)\nTên tiếng Việt: Ớt cay tươi (dùng như rau)\nTừ khóa: ớt, ớt tươi, ớt cay\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 251; Việt Nam: 9\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 69%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 13%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 10%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 6%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 5%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CLAMS",
   "title": "Nhóm sản phẩm FDA: Nghêu, ngao",
   "text": "Nhóm FDA: CLAMS\nTên tiếng Việt: Nghêu, ngao\nTừ khóa: nghêu, ngao, sò\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 69; Việt Nam: 9\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 55%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 12%; Dư lượng thuốc bảo vệ thực vật: 10%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 9%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 7%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 44%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 33%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 33%; Nhãn sai hoặc gây hiểu lầm: 22%; Thông tin bắt buộc không có tiếng Anh: 22%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-ANCHOVY",
   "title": "Nhóm sản phẩm FDA: Cá cơm",
   "text": "Nhóm FDA: ANCHOVY\nTên tiếng Việt: Cá cơm\nTừ khóa: cá cơm, cá cơm khô\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 63; Việt Nam: 9\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 49%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 21%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 11%; Vi phạm quy định HACCP thủy sản: 8%; Thiếu hoặc sai danh sách thành phần: 6%\nLỗi thường gặp (Việt Nam): Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 67%; Dư lượng thuốc bảo vệ thực vật: 22%; Nhiễm Salmonella: 11%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LYCHEE-LICHEE-LITCHI-LEECHEE-SUBTROP",
   "title": "Nhóm sản phẩm FDA: Vải",
   "text": "Nhóm FDA: LYCHEE, LICHEE, LITCHI, LEECHEE (SUBTROPICAL AND TROPICAL FRUIT)\nTên tiếng Việt: Vải\nTừ khóa: vải, vải thiều, quả vải\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 11; Việt Nam: 9\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Mất vệ sinh do kiểm soát quy trình không đầy đủ: 55%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 27%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 27%; Cơ sở nước ngoài từ chối cho FDA thanh tra: 18%; 3600: 9%\nLỗi thường gặp (Việt Nam): Mất vệ sinh do kiểm soát quy trình không đầy đủ: 67%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 33%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SHRIMP-PRAWNS",
   "title": "Nhóm sản phẩm FDA: Tôm (chế biến thông thường)",
   "text": "Nhóm FDA: SHRIMP & PRAWNS\nTên tiếng Việt: Tôm (chế biến thông thường)\nTừ khóa: tôm, tôm đông lạnh, tôm chế biến\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 127; Việt Nam: 8\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 43%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 31%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 28%; Phụ gia thực phẩm không được phép: 19%; Dư lượng nitrofuran (kháng sinh cấm): 10%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 75%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 25%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-SHELLED",
   "title": "Nhóm sản phẩm FDA: Cơm dừa (đã bóc vỏ)",
   "text": "Nhóm FDA: COCONUT, SHELLED\nTên tiếng Việt: Cơm dừa (đã bóc vỏ)\nTừ khóa: dừa, cơm dừa, cùi dừa\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 57; Việt Nam: 8\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 53%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 46%; Nhiễm Salmonella: 42%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 19%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 7%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 62%; Phẩm màu không an toàn / không được phép: 38%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 38%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MACKEREL-ALL-EXCEPT-SCOMBEROMORUS-SP-E",
   "title": "Nhóm sản phẩm FDA: Cá thu / cá bạc má (mackerel, trừ cá thu vua)",
   "text": "Nhóm FDA: MACKEREL (ALL EXCEPT SCOMBEROMORUS SP, EG SPANISH OR KING SEE '22')\nTên tiếng Việt: Cá thu / cá bạc má (mackerel, trừ cá thu vua)\nTừ khóa: cá thu, cá bạc má, cá saba, mackerel\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 29; Việt Nam: 8\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Vi phạm quy định HACCP thủy sản: 31%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 21%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 14%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 14%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 10%\nLỗi thường gặp (Việt Nam): Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 50%; Vi phạm quy định HACCP thủy sản: 38%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 12%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 12%; Nhiễm Salmonella: 12%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GOURMAY-GOURAMI",
   "title": "Nhóm sản phẩm FDA: Cá sặc / cá tai tượng (gourami)",
   "text": "Nhóm FDA: GOURMAY, GOURAMI\nTên tiếng Việt: Cá sặc / cá tai tượng (gourami)\nTừ khóa: cá sặc, cá tai tượng, gourami\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 23; Việt Nam: 8\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 61%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 35%; Nhiễm Salmonella: 4%; 186: 4%; Vi phạm quy định HACCP thủy sản: 4%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 75%; 186: 12%; Vi phạm quy định HACCP thủy sản: 12%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 12%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-DURIAN-DURION-SUBTROPICAL-AND-TROPICAL",
   "title": "Nhóm sản phẩm FDA: Sầu riêng",
   "text": "Nhóm FDA: DURIAN, DURION (SUBTROPICAL AND TROPICAL FRUIT)\nTên tiếng Việt: Sầu riêng\nTừ khóa: sầu riêng, sầu riêng đông lạnh\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 13; Việt Nam: 8\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 100%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-FRAGRANT-PROCESSED-PACKAGED-",
   "title": "Nhóm sản phẩm FDA: Gạo thơm đóng gói",
   "text": "Nhóm FDA: RICE, FRAGRANT, PROCESSED (PACKAGED)\nTên tiếng Việt: Gạo thơm đóng gói\nTừ khóa: gạo thơm, gạo đóng gói, gạo\nNgành: Gạo, ngũ cốc nguyên hạt và tinh bột\nSố dòng từ chối toàn cầu: 10; Việt Nam: 8\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 90%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 10%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LESSER-GALANGALE-GROUND-CRACKED-SPICE",
   "title": "Nhóm sản phẩm FDA: Riềng nhỏ (cao lương khương), bột hoặc nghiền",
   "text": "Nhóm FDA: LESSER GALANGALE, GROUND, CRACKED (SPICE)\nTên tiếng Việt: Riềng nhỏ (cao lương khương), bột hoặc nghiền\nTừ khóa: riềng, bột riềng, cao lương khương\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 8; Việt Nam: 8\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 88%; 3400: 12%\nLỗi thường gặp (Việt Nam): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 88%; 3400: 12%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TILAPIA",
   "title": "Nhóm sản phẩm FDA: Cá rô phi",
   "text": "Nhóm FDA: TILAPIA\nTên tiếng Việt: Cá rô phi\nTừ khóa: cá rô phi, cá điêu hồng\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 42; Việt Nam: 7\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 33%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 19%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 19%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 14%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 14%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 71%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 29%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-APRICOT-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Mơ sấy hoặc dạng nhão",
   "text": "Nhóm FDA: APRICOT, DRIED OR PASTE\nTên tiếng Việt: Mơ sấy hoặc dạng nhão\nTừ khóa: mơ sấy, ô mai mơ, mơ khô, xí muội\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 28; Việt Nam: 7\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): 2040: 46%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 25%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 18%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 11%; 245: 7%\nLỗi thường gặp (Việt Nam): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MEDICAL-FOODS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Thực phẩm dùng cho mục đích y tế",
   "text": "Nhóm FDA: MEDICAL FOODS, N.E.C.\nTên tiếng Việt: Thực phẩm dùng cho mục đích y tế\nTừ khóa: thực phẩm y học, thực phẩm dinh dưỡng y tế\nNgành: Thực phẩm dinh dưỡng đặc biệt\nSố dòng từ chối toàn cầu: 21; Việt Nam: 7\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 81%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 76%; Bị coi là thuốc mới chưa phê duyệt: 62%; Thiếu hoặc sai danh sách thành phần: 14%; Thiếu hoặc sai khối lượng tịnh: 14%\nLỗi thường gặp (Việt Nam): Thông tin bắt buộc không có tiếng Anh: 71%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 57%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 29%; Bị coi là thuốc mới chưa phê duyệt: 29%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 29%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CASSAVA-MICROGREEN-",
   "title": "Nhóm sản phẩm FDA: Sắn / khoai mì (nhóm rau mầm, rau non)",
   "text": "Nhóm FDA: CASSAVA (MICROGREEN)\nTên tiếng Việt: Sắn / khoai mì (nhóm rau mầm, rau non)\nTừ khóa: lá sắn, rau mầm sắn, lá khoai mì\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 9; Việt Nam: 7\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 44%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 33%; Thiếu hoặc sai danh sách thành phần: 22%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 22%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 57%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 43%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FOODS-WITH-SUPPLEMENTAL-NUTRIENTS-ADDED-",
   "title": "Nhóm sản phẩm FDA: Thực phẩm bổ sung dưỡng chất (có hoặc không chất tạo ngọt nhân tạo)",
   "text": "Nhóm FDA: FOODS WITH SUPPLEMENTAL NUTRIENTS ADDED, WITH OR WITHOUT ARTIFICAL SWEETNERS\nTên tiếng Việt: Thực phẩm bổ sung dưỡng chất (có hoặc không chất tạo ngọt nhân tạo)\nTừ khóa: thực phẩm tăng cường vi chất, sản phẩm dinh dưỡng, thực phẩm bổ sung\nNgành: Thực phẩm dinh dưỡng đặc biệt\nSố dòng từ chối toàn cầu: 321; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bị coi là thuốc mới chưa phê duyệt: 42%; Thông tin bắt buộc không có tiếng Anh: 29%; 472: 18%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 15%; 2300: 8%\nLỗi thường gặp (Việt Nam): Thông tin bắt buộc không có tiếng Anh: 67%; Thông tin bắt buộc không nổi bật / khó đọc: 17%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 17%; 2300: 17%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CAKE-WITHOUT-CUSTARD-OR-CREAM-FILLING",
   "title": "Nhóm sản phẩm FDA: Bánh ngọt không nhân kem",
   "text": "Nhóm FDA: CAKE WITHOUT CUSTARD OR CREAM FILLING\nTên tiếng Việt: Bánh ngọt không nhân kem\nTừ khóa: bánh bông lan, bánh ngọt, bánh cake\nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 161; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa melamine: 50%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 22%; Thông tin bắt buộc không có tiếng Anh: 22%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 20%; Không phù hợp làm thực phẩm: 20%\nLỗi thường gặp (Việt Nam): Thiếu hoặc sai khối lượng tịnh: 67%; Thiếu tên thông dụng của sản phẩm: 67%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 67%; Không khai báo đủ chất gây dị ứng chính: 67%; Phẩm màu không an toàn / không được phép: 17%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CRAB",
   "title": "Nhóm sản phẩm FDA: Cua, ghẹ",
   "text": "Nhóm FDA: CRAB\nTên tiếng Việt: Cua, ghẹ\nTừ khóa: cua, ghẹ, thịt cua\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 97; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 42%; 3885: 25%; 2900: 15%; Nhiễm Salmonella: 8%; 315: 7%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 50%; 2900: 33%; 3885: 33%; Nhiễm Salmonella: 17%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-EEL",
   "title": "Nhóm sản phẩm FDA: Lươn / cá chình",
   "text": "Nhóm FDA: EEL\nTên tiếng Việt: Lươn / cá chình\nTừ khóa: lươn, cá chình\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 96; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 35%; Phụ gia thực phẩm không được phép: 26%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 23%; Nhiễm Salmonella: 16%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 15%\nLỗi thường gặp (Việt Nam): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 33%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 33%; Nhiễm Salmonella: 33%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-SUBTROPICAL-AND-TROPICAL-FRUIT-",
   "title": "Nhóm sản phẩm FDA: Nước dừa, nước cốt dừa, sữa dừa",
   "text": "Nhóm FDA: COCONUT, SUBTROPICAL AND TROPICAL FRUIT, JUICES, MILK, CREME, DRINKS AND NECTARS\nTên tiếng Việt: Nước dừa, nước cốt dừa, sữa dừa\nTừ khóa: nước dừa, nước cốt dừa, sữa dừa, kem dừa\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 45; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 42%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 27%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 18%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 11%; Chứa melamine: 11%\nLỗi thường gặp (Việt Nam): Đồ uống chứa nước ép không ghi phần trăm nước ép: 50%; Thông tin bắt buộc không nổi bật / khó đọc: 50%; 48: 33%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 17%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 17%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-SUBTROPICAL-TROPICAL-FRUIT-PUL",
   "title": "Nhóm sản phẩm FDA: Cùi me (nghiền)",
   "text": "Nhóm FDA: TAMARIND (SUBTROPICAL/TROPICAL FRUIT PULP)\nTên tiếng Việt: Cùi me (nghiền)\nTừ khóa: cơm me, cùi me, me\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 41; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 2%; Thông tin bắt buộc không có tiếng Anh: 2%\nLỗi thường gặp (Việt Nam): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TEA-LIQUID",
   "title": "Nhóm sản phẩm FDA: Trà dạng lỏng (trà đóng chai, pha sẵn)",
   "text": "Nhóm FDA: TEA, LIQUID\nTên tiếng Việt: Trà dạng lỏng (trà đóng chai, pha sẵn)\nTừ khóa: trà đóng chai, trà pha sẵn, nước trà\nNgành: Cà phê và trà\nSố dòng từ chối toàn cầu: 36; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 56%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 44%; Thông tin bắt buộc không có tiếng Anh: 42%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 31%; Thiếu hoặc sai khối lượng tịnh: 11%\nLỗi thường gặp (Việt Nam): Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 100%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-WHOLE-SPICE-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Gia vị nguyên dạng, loại khác",
   "text": "Nhóm FDA: WHOLE SPICE, N.E.C.\nTên tiếng Việt: Gia vị nguyên dạng, loại khác\nTừ khóa: gia vị nguyên hạt, gia vị khô\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 33; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 27%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 24%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 18%; Nhiễm Salmonella: 15%; Thiếu hoặc sai khối lượng tịnh: 12%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 67%; Cơ sở nước ngoài từ chối cho FDA thanh tra: 17%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 17%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SNAILS-AQUATIC-OTHER-AQUATIC-SPECIES",
   "title": "Nhóm sản phẩm FDA: Ốc nước",
   "text": "Nhóm FDA: SNAILS, AQUATIC, OTHER AQUATIC SPECIES\nTên tiếng Việt: Ốc nước\nTừ khóa: ốc, ốc bươu, ốc nhồi\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 23; Việt Nam: 6\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 65%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 13%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 13%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 9%; Thiếu hoặc sai danh sách thành phần: 9%\nLỗi thường gặp (Việt Nam): Nhiễm Salmonella: 83%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 17%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-NONCARBONATED-SOFT-DRINK-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Nước giải khát không ga, loại khác",
   "text": "Nhóm FDA: NONCARBONATED SOFT DRINK, N.E.C.\nTên tiếng Việt: Nước giải khát không ga, loại khác\nTừ khóa: nước giải khát, nước ngọt không ga\nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 106; Việt Nam: 5\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 41%; Thông tin bắt buộc không có tiếng Anh: 22%; Chứa melamine: 20%; Thiếu hoặc sai danh sách thành phần: 19%; Thiếu hoặc sai khối lượng tịnh: 19%\nLỗi thường gặp (Việt Nam): Có phẩm màu nhân tạo nhưng nhãn không ghi: 80%; Phẩm màu không an toàn / không được phép: 60%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 20%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MELON-SEEDS-EDIBLE-SEED-",
   "title": "Nhóm sản phẩm FDA: Hạt dưa",
   "text": "Nhóm FDA: MELON SEEDS (EDIBLE SEED)\nTên tiếng Việt: Hạt dưa\nTừ khóa: hạt dưa, hạt dưa hấu, hạt dưa rang\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 86; Việt Nam: 5\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 55%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 17%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 10%; Phẩm màu không an toàn / không được phép: 7%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 6%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 80%; Phẩm màu không an toàn / không được phép: 20%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PLUM-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Mận sấy hoặc dạng nhão",
   "text": "Nhóm FDA: PLUM, DRIED OR PASTE\nTên tiếng Việt: Mận sấy hoặc dạng nhão\nTừ khóa: mận sấy, ô mai mận, xí muội\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 57; Việt Nam: 5\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 35%; 3400: 35%; Thông tin bắt buộc không có tiếng Anh: 12%; 2640: 9%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 9%\nLỗi thường gặp (Việt Nam): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 80%; 3400: 20%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MUSHROOM-STRAW-FUNGI-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Nấm rơm, sản phẩm nấm khác",
   "text": "Nhóm FDA: MUSHROOM, STRAW, FUNGI PRODUCTS, N.E.C.\nTên tiếng Việt: Nấm rơm, sản phẩm nấm khác\nTừ khóa: nấm rơm\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 6; Việt Nam: 5\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 83%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 17%\nLỗi thường gặp (Việt Nam): Dư lượng thuốc bảo vệ thực vật: 100%\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SAUCES-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Nước sốt, loại khác",
   "text": "Nhóm FDA: SAUCES, N.E.C.\nTên tiếng Việt: Nước sốt, loại khác\nTừ khóa: nước sốt, sốt, nước chấm\nNgành: Sốt và món ăn chế biến sẵn\nSố dòng từ chối toàn cầu: 577; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 47%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 13%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 12%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 12%; Phẩm màu không an toàn / không được phép: 11%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-SUBTROPICAL-AND-TROPICAL-FRUIT",
   "title": "Nhóm sản phẩm FDA: Me (trái cây nhiệt đới)",
   "text": "Nhóm FDA: TAMARIND (SUBTROPICAL AND TROPICAL FRUIT)\nTên tiếng Việt: Me (trái cây nhiệt đới)\nTừ khóa: me, trái me, me tươi\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 218; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 94%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 2%; Thiếu hoặc sai khối lượng tịnh: 2%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 2%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 2%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BAKED-SNACK-FOOD-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Snack nướng, loại khác",
   "text": "Nhóm FDA: BAKED SNACK FOOD, N.E.C.\nTên tiếng Việt: Snack nướng, loại khác\nTừ khóa: snack nướng, bánh snack\nNgành: Snack\nSố dòng từ chối toàn cầu: 165; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 37%; Chứa melamine: 18%; Thông tin bắt buộc không có tiếng Anh: 16%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 15%; Thiếu hoặc sai khối lượng tịnh: 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CHILI-SAUCE",
   "title": "Nhóm sản phẩm FDA: Tương ớt",
   "text": "Nhóm FDA: CHILI SAUCE\nTên tiếng Việt: Tương ớt\nTừ khóa: tương ớt, sốt ớt\nNgành: Sốt và món ăn chế biến sẵn\nSố dòng từ chối toàn cầu: 126; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Phụ gia thực phẩm không được phép: 22%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 20%; Phẩm màu không an toàn / không được phép: 18%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-HONEY",
   "title": "Nhóm sản phẩm FDA: Mật ong",
   "text": "Nhóm FDA: HONEY\nTên tiếng Việt: Mật ong\nTừ khóa: mật ong\nNgành: Chất tạo ngọt (mật ong...)\nSố dòng từ chối toàn cầu: 81; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): 265: 36%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 19%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 12%; Thiếu hoặc sai khối lượng tịnh: 11%; Phụ gia thực phẩm không được phép: 11%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAMARIND-TOPPING-OR-SYRUP",
   "title": "Nhóm sản phẩm FDA: Siro, sốt phủ từ me",
   "text": "Nhóm FDA: TAMARIND, TOPPING OR SYRUP\nTên tiếng Việt: Siro, sốt phủ từ me\nTừ khóa: siro me, sốt me\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 31; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 94%; Thông tin bắt buộc không có tiếng Anh: 6%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 3%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 3%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 3%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-ONION-BULB-YELLOW-WHITE-RED-ETC-R",
   "title": "Nhóm sản phẩm FDA: Hành tây / củ hành (các loại)",
   "text": "Nhóm FDA: ONION BULB (YELLOW, WHITE, RED, ETC.) (ROOT & TUBER VEGETABLE)\nTên tiếng Việt: Hành tây / củ hành (các loại)\nTừ khóa: hành tây, hành củ, củ hành\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 21; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 38%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 33%; 245: 10%; Nhãn sai hoặc gây hiểu lầm: 10%; 48: 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CASSAVA-ROOT-AND-TUBER-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: Sắn / khoai mì (củ)",
   "text": "Nhóm FDA: CASSAVA (ROOT AND TUBER VEGETABLE)\nTên tiếng Việt: Sắn / khoai mì (củ)\nTừ khóa: sắn, khoai mì, củ sắn, sắn lát\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 14; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 21%; Dư lượng thuốc bảo vệ thực vật: 14%; Thông tin bắt buộc không có tiếng Anh: 14%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 14%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BANANA-SUBTROPICAL-AND-TROPICAL-FRUIT-",
   "title": "Nhóm sản phẩm FDA: Chuối",
   "text": "Nhóm FDA: BANANA (SUBTROPICAL AND TROPICAL FRUIT)\nTên tiếng Việt: Chuối\nTừ khóa: chuối, chuối tươi\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 13; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 31%; Dư lượng thuốc bảo vệ thực vật: 23%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 23%; Thông tin bắt buộc không nổi bật / khó đọc: 8%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FISH-PASTE-FISHERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Mắm cá / cá xay nhuyễn",
   "text": "Nhóm FDA: FISH PASTE, FISHERY PRODUCTS, N.E.C.\nTên tiếng Việt: Mắm cá / cá xay nhuyễn\nTừ khóa: mắm cá, cá xay, chả cá\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 12; Việt Nam: 4\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 42%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 33%; Thiếu hoặc sai danh sách thành phần: 33%; Thông tin bắt buộc không có tiếng Anh: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BLACK-BEAN-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Đậu đen khô hoặc dạng nhão (tương đậu đen)",
   "text": "Nhóm FDA: BLACK BEAN, DRIED OR PASTE\nTên tiếng Việt: Đậu đen khô hoặc dạng nhão (tương đậu đen)\nTừ khóa: đậu đen, tương đậu đen\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 10; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 70%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 20%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 10%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BASIL-SEED-SOFT-DRINK-NONCARBONATED",
   "title": "Nhóm sản phẩm FDA: Nước giải khát hạt é (hạt húng quế)",
   "text": "Nhóm FDA: BASIL SEED SOFT DRINK, NONCARBONATED\nTên tiếng Việt: Nước giải khát hạt é (hạt húng quế)\nTừ khóa: hạt é, nước hạt é, hạt húng quế\nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 8; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 50%; Thiếu hoặc sai danh sách thành phần: 38%; Thiếu tên thông dụng của sản phẩm: 38%; Nhãn sai hoặc gây hiểu lầm: 25%; Đồ uống chứa nước ép không ghi phần trăm nước ép: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FROG-LEGS-OTHER-AQUATIC-SPECIES",
   "title": "Nhóm sản phẩm FDA: Đùi ếch",
   "text": "Nhóm FDA: FROG LEGS, OTHER AQUATIC SPECIES\nTên tiếng Việt: Đùi ếch\nTừ khóa: đùi ếch, chân ếch\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 8; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 88%; Dư lượng nitrofuran (kháng sinh cấm): 50%; Nhiễm Salmonella: 12%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BONITO",
   "title": "Nhóm sản phẩm FDA: Cá ngừ bonito",
   "text": "Nhóm FDA: BONITO\nTên tiếng Việt: Cá ngừ bonito\nTừ khóa: cá ngừ bonito, bonito\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 5; Việt Nam: 4\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Vi phạm quy định HACCP thủy sản: 40%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 40%; Chứa histamine (ngộ độc scombroid): 20%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MULLET",
   "title": "Nhóm sản phẩm FDA: Cá đối",
   "text": "Nhóm FDA: MULLET\nTên tiếng Việt: Cá đối\nTừ khóa: cá đối\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 4; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Vi phạm quy định HACCP thủy sản: 50%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 50%; Nhãn sai hoặc gây hiểu lầm: 25%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 25%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SUGAR-CANE-LEAF-STEM-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: Mía (thân, lá)",
   "text": "Nhóm FDA: SUGAR CANE (LEAF & STEM VEGETABLE)\nTên tiếng Việt: Mía (thân, lá)\nTừ khóa: mía, cây mía\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 4; Việt Nam: 4\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-OTHER-BAKERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Sản phẩm bánh nướng khác",
   "text": "Nhóm FDA: OTHER BAKERY PRODUCTS, N.E.C.\nTên tiếng Việt: Sản phẩm bánh nướng khác\nTừ khóa: bánh nướng, bánh, sản phẩm bánh\nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 548; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 60%; Chứa melamine: 10%; Phẩm màu không an toàn / không được phép: 9%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 9%; Thiếu hoặc sai danh sách thành phần: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MANGO-SUBTROPICAL-AND-TROPICAL-FRUIT-",
   "title": "Nhóm sản phẩm FDA: Xoài",
   "text": "Nhóm FDA: MANGO (SUBTROPICAL AND TROPICAL FRUIT)\nTên tiếng Việt: Xoài\nTừ khóa: xoài, xoài tươi, xoài đông lạnh\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 211; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 52%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 15%; Nhãn sai hoặc gây hiểu lầm: 9%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 6%; Nhiễm Salmonella: 5%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COOKIE-BISCUIT-WAFER-DOUGH-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Bánh quy, bánh xốp, loại khác",
   "text": "Nhóm FDA: COOKIE,BISCUIT,WAFER DOUGH, N.E.C.\nTên tiếng Việt: Bánh quy, bánh xốp, loại khác\nTừ khóa: bánh quy, bánh xốp, bánh bích quy\nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 185; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa melamine: 49%; Thông tin bắt buộc không có tiếng Anh: 32%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 20%; Không phù hợp làm thực phẩm: 19%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PEPPER-BLACK-WHOLE-SPICE-",
   "title": "Nhóm sản phẩm FDA: Tiêu đen nguyên hạt",
   "text": "Nhóm FDA: PEPPER,BLACK, WHOLE (SPICE)\nTên tiếng Việt: Tiêu đen nguyên hạt\nTừ khóa: tiêu, hạt tiêu, tiêu đen, hồ tiêu\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 146; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 80%; Nhiễm Salmonella: 78%; 157: 8%; 3910: 2%; 2420: 1%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CAPSICUMS-CAYENNE-CHILI-HOT-PEPPERS-",
   "title": "Nhóm sản phẩm FDA: Ớt cay nguyên quả / khô (gia vị)",
   "text": "Nhóm FDA: CAPSICUMS (CAYENNE CHILI, HOT PEPPERS), WHOLE (SPICE)\nTên tiếng Việt: Ớt cay nguyên quả / khô (gia vị)\nTừ khóa: ớt khô, ớt nguyên quả, ớt cay\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 78; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 64%; Nhiễm Salmonella: 13%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 10%; Dư lượng thuốc bảo vệ thực vật: 6%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 6%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CONDIMENTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Gia vị / đồ chấm, loại khác",
   "text": "Nhóm FDA: CONDIMENTS, N.E.C.\nTên tiếng Việt: Gia vị / đồ chấm, loại khác\nTừ khóa: nước chấm, đồ chấm, gia vị\nNgành: Nước chấm và đồ chấm\nSố dòng từ chối toàn cầu: 55; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 24%; Thông tin bắt buộc không có tiếng Anh: 22%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 22%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 20%; Thiếu hoặc sai khối lượng tịnh: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-ORIENTAL-NOODLES-FLAVORED-WITH-SHRIMP-C",
   "title": "Nhóm sản phẩm FDA: Mì kiểu châu Á (vị tôm, gà, bò...)",
   "text": "Nhóm FDA: ORIENTAL NOODLES (FLAVORED WITH SHRIMP,CHICKEN,BEEF,LOBSTER,CRAB,PLAIN,ETC.)\nTên tiếng Việt: Mì kiểu châu Á (vị tôm, gà, bò...)\nTừ khóa: mì châu Á, mì vị tôm, mì hương vị\nNgành: Mì, bún và ngũ cốc chế biến\nSố dòng từ chối toàn cầu: 53; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 30%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 23%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 17%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 15%; Thiếu hoặc sai danh sách thành phần: 11%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CASSAVA-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Sắn khô hoặc dạng nhão",
   "text": "Nhóm FDA: CASSAVA, DRIED OR PASTE\nTên tiếng Việt: Sắn khô hoặc dạng nhão\nTừ khóa: sắn khô, sắn lát khô, khoai mì khô\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 44; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 59%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 50%; Thiếu hoặc sai danh sách thành phần: 32%; Thiếu hoặc sai khối lượng tịnh: 23%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SEAWEED-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Rong biển sấy khô hoặc dạng nhão",
   "text": "Nhóm FDA: SEAWEED, DRIED OR PASTE\nTên tiếng Việt: Rong biển sấy khô hoặc dạng nhão\nTừ khóa: rong biển, tảo biển, rong biển khô\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 43; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 65%; Dư lượng thuốc bảo vệ thực vật: 14%; Thiếu hoặc sai khối lượng tịnh: 9%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 7%; Thiếu hoặc sai danh sách thành phần: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-EDIBLE-SEEDS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Hạt ăn được, loại khác",
   "text": "Nhóm FDA: EDIBLE SEEDS, N.E.C.\nTên tiếng Việt: Hạt ăn được, loại khác\nTừ khóa: hạt ăn được, hạt khô, hạt rang\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 34; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 29%; Phẩm màu không an toàn / không được phép: 26%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 26%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 21%; Thiếu tên thông dụng của sản phẩm: 15%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FUNGUS-BLACK-CLOUD-EARS-FUNGI-PRODUC",
   "title": "Nhóm sản phẩm FDA: Mộc nhĩ (nấm tai mèo), sản phẩm nấm khác",
   "text": "Nhóm FDA: FUNGUS, BLACK (CLOUD EARS), FUNGI PRODUCTS, N.E.C.\nTên tiếng Việt: Mộc nhĩ (nấm tai mèo), sản phẩm nấm khác\nTừ khóa: mộc nhĩ, nấm mèo\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 30; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 70%; Dư lượng thuốc bảo vệ thực vật: 20%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 7%; Thông tin bắt buộc không nổi bật / khó đọc: 7%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CORN-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: Bắp / ngô (dùng như rau)",
   "text": "Nhóm FDA: CORN, (VEGETABLE)\nTên tiếng Việt: Bắp / ngô (dùng như rau)\nTừ khóa: bắp, ngô, bắp ngọt\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 26; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 46%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 19%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 8%; Nhiễm Salmonella: 8%; 254: 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PALM-NUT-PALM-FRUIT-SUGAR-PALM-ALL-OTHE",
   "title": "Nhóm sản phẩm FDA: Quả cọ / thốt nốt (trừ cau)",
   "text": "Nhóm FDA: PALM NUT/PALM FRUIT/SUGAR PALM (ALL OTHER EXCEPT FOR PALM NUT ARECA, ARECA NUT OR BETEL NUT) (FRUIT)\nTên tiếng Việt: Quả cọ / thốt nốt (trừ cau)\nTừ khóa: thốt nốt, quả cọ, trái thốt nốt\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 15; Việt Nam: 3\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 67%; Nhiễm Salmonella: 13%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 13%; Mất vệ sinh do kiểm soát quy trình không đầy đủ: 13%; Chứa chất độc hại thường gây hại cho sức khỏe: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SALT-TABLE-SALT-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Muối ăn",
   "text": "Nhóm FDA: SALT (TABLE SALT) N.E.C.\nTên tiếng Việt: Muối ăn\nTừ khóa: muối, muối ăn, muối biển\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 11; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 45%; 3600: 18%; Phẩm màu không an toàn / không được phép: 9%; Thông tin bắt buộc không có tiếng Anh: 9%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 9%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-JASMINE-PROCESSED-PACKAGED-",
   "title": "Nhóm sản phẩm FDA: Gạo Jasmine đóng gói",
   "text": "Nhóm FDA: RICE, JASMINE, PROCESSED (PACKAGED)\nTên tiếng Việt: Gạo Jasmine đóng gói\nTừ khóa: gạo jasmine, gạo thơm, gạo\nNgành: Gạo, ngũ cốc nguyên hạt và tinh bột\nSố dòng từ chối toàn cầu: 10; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 50%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 40%; Thiếu hoặc sai danh sách thành phần: 10%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 10%; Thiếu hoặc sai khối lượng tịnh: 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COBIA",
   "title": "Nhóm sản phẩm FDA: Cá bớp (cobia)",
   "text": "Nhóm FDA: COBIA\nTên tiếng Việt: Cá bớp (cobia)\nTừ khóa: cá bớp, cá giò\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 7; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 57%; Nhiễm Salmonella: 43%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-APRICOT-PIT-FRUIT-",
   "title": "Nhóm sản phẩm FDA: Mơ (quả)",
   "text": "Nhóm FDA: APRICOT (PIT FRUIT)\nTên tiếng Việt: Mơ (quả)\nTừ khóa: mơ, quả mơ\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 5; Việt Nam: 3\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 60%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 20%; 2040: 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-ROCKFISH",
   "title": "Nhóm sản phẩm FDA: Cá đá (rockfish)",
   "text": "Nhóm FDA: ROCKFISH\nTên tiếng Việt: Cá đá (rockfish)\nTừ khóa: cá đá, rockfish\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 3; Việt Nam: 3\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SWEET-POTATO-MICROGREEN-",
   "title": "Nhóm sản phẩm FDA: Khoai lang (rau non, lá)",
   "text": "Nhóm FDA: SWEET POTATO (MICROGREEN)\nTên tiếng Việt: Khoai lang (rau non, lá)\nTừ khóa: lá khoai lang, rau lang, rau mầm khoai lang\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 3; Việt Nam: 3\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 67%; Dư lượng thuốc bảo vệ thực vật: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-DIETARY-CONVENTIONAL-FOODS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Thực phẩm thông thường cho chế độ ăn đặc biệt",
   "text": "Nhóm FDA: DIETARY CONVENTIONAL FOODS, N.E.C.\nTên tiếng Việt: Thực phẩm thông thường cho chế độ ăn đặc biệt\nTừ khóa: thực phẩm ăn kiêng, thực phẩm dinh dưỡng\nNgành: Thực phẩm dinh dưỡng đặc biệt\nSố dòng từ chối toàn cầu: 236; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bị coi là thuốc mới chưa phê duyệt: 47%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 45%; Thông tin bắt buộc không có tiếng Anh: 31%; Nhãn sai hoặc gây hiểu lầm: 11%; 3864: 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PEPPER-BLACK-GROUND-CRACKED-SPICE-",
   "title": "Nhóm sản phẩm FDA: Tiêu đen xay, nghiền",
   "text": "Nhóm FDA: PEPPER, BLACK, GROUND, CRACKED (SPICE)\nTên tiếng Việt: Tiêu đen xay, nghiền\nTừ khóa: bột tiêu, tiêu xay, tiêu đen xay\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 190; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 81%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 68%; 157: 14%; 3600: 3%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 2%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TAPIOCA-STARCH-PRODUCT",
   "title": "Nhóm sản phẩm FDA: Sản phẩm từ tinh bột sắn (tapioca)",
   "text": "Nhóm FDA: TAPIOCA STARCH PRODUCT\nTên tiếng Việt: Sản phẩm từ tinh bột sắn (tapioca)\nTừ khóa: bột năng, tinh bột sắn, trân châu, tapioca\nNgành: Gạo, ngũ cốc nguyên hạt và tinh bột\nSố dòng từ chối toàn cầu: 74; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 39%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 15%; Thiếu hoặc sai danh sách thành phần: 15%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 12%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 12%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-PROCESSED-PACKAGED-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Gạo đóng gói, loại khác",
   "text": "Nhóm FDA: RICE, PROCESSED (PACKAGED) N.E.C.\nTên tiếng Việt: Gạo đóng gói, loại khác\nTừ khóa: gạo, gạo đóng gói\nNgành: Gạo, ngũ cốc nguyên hạt và tinh bột\nSố dòng từ chối toàn cầu: 70; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 77%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 7%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 7%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 6%; Thông tin bắt buộc không có tiếng Anh: 6%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-YOGURT-PLAIN-FLAVORED-OR-FRUIT-ADDED-",
   "title": "Nhóm sản phẩm FDA: Sữa chua",
   "text": "Nhóm FDA: YOGURT (PLAIN, FLAVORED OR FRUIT ADDED)\nTên tiếng Việt: Sữa chua\nTừ khóa: sữa chua, yaourt, yogurt\nNgành: Sữa và sản phẩm từ sữa\nSố dòng từ chối toàn cầu: 57; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 32%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 26%; Chứa melamine: 25%; Không phù hợp làm thực phẩm: 16%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CROAKER",
   "title": "Nhóm sản phẩm FDA: Cá lù đù (croaker)",
   "text": "Nhóm FDA: CROAKER\nTên tiếng Việt: Cá lù đù (croaker)\nTừ khóa: cá lù đù, cá đù\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 54; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 57%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 22%; 2000: 6%; Thiếu hoặc sai danh sách thành phần: 4%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 4%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-OCTOPUS-OTHER-AQUATIC-SPECIES",
   "title": "Nhóm sản phẩm FDA: Bạch tuộc",
   "text": "Nhóm FDA: OCTOPUS, OTHER AQUATIC SPECIES\nTên tiếng Việt: Bạch tuộc\nTừ khóa: bạch tuộc\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 53; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 38%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 30%; Thiếu hoặc sai danh sách thành phần: 11%; Không khai báo đủ chất gây dị ứng chính: 11%; Nhiễm Listeria monocytogenes: 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FUNGUS-BLACK-CLOUD-EARS-WHOLE-BUTTO",
   "title": "Nhóm sản phẩm FDA: Mộc nhĩ nguyên tai",
   "text": "Nhóm FDA: FUNGUS, BLACK (CLOUD EARS), WHOLE (BUTTON) (FUNGI)\nTên tiếng Việt: Mộc nhĩ nguyên tai\nTừ khóa: mộc nhĩ, nấm mèo\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 39; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 62%; Nhiễm Salmonella: 33%; Dư lượng thuốc bảo vệ thực vật: 13%; Thiếu hoặc sai danh sách thành phần: 3%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 3%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SQUID-OTHER-AQUATIC-SPECIES",
   "title": "Nhóm sản phẩm FDA: Mực ống",
   "text": "Nhóm FDA: SQUID, OTHER AQUATIC SPECIES\nTên tiếng Việt: Mực ống\nTừ khóa: mực, mực ống, mực đông lạnh\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 39; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): 315: 31%; Vi phạm quy định HACCP thủy sản: 31%; Nhiễm Salmonella: 13%; Phẩm màu không an toàn / không được phép: 5%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 5%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LEMON-CITRUS-FRUIT-JUICES-OR-CONCENTRAT",
   "title": "Nhóm sản phẩm FDA: Nước ép / nước cốt chanh",
   "text": "Nhóm FDA: LEMON, CITRUS FRUIT JUICES OR CONCENTRATES\nTên tiếng Việt: Nước ép / nước cốt chanh\nTừ khóa: nước chanh, nước cốt chanh\nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 29; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): 315: 34%; 265: 28%; 3621: 14%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 10%; Thiếu hoặc sai danh sách thành phần: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CURRY-POWDER-WITHOUT-SALT",
   "title": "Nhóm sản phẩm FDA: Bột cà ri (không muối)",
   "text": "Nhóm FDA: CURRY POWDER, WITHOUT SALT\nTên tiếng Việt: Bột cà ri (không muối)\nTừ khóa: bột cà ri, cà ri\nNgành: Gia vị\nSố dòng từ chối toàn cầu: 21; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 76%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 14%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 5%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 5%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 5%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-CAKES",
   "title": "Nhóm sản phẩm FDA: Bánh gạo",
   "text": "Nhóm FDA: RICE CAKES\nTên tiếng Việt: Bánh gạo\nTừ khóa: bánh gạo\nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 20; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 30%; Chứa melamine: 30%; Phẩm màu không an toàn / không được phép: 20%; Cơ sở nước ngoài từ chối cho FDA thanh tra: 10%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SUTROPICAL-AND-TROPICAL-FRUIT-JUICE-MI",
   "title": "Nhóm sản phẩm FDA: Nước ép / đồ uống từ trái cây nhiệt đới, loại khác",
   "text": "Nhóm FDA: SUTROPICAL AND TROPICAL FRUIT, JUICE, MILK, CREME, DRINK OR NECTAR, N.E.C.\nTên tiếng Việt: Nước ép / đồ uống từ trái cây nhiệt đới, loại khác\nTừ khóa: nước ép trái cây, nước trái cây nhiệt đới\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 16; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 38%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 38%; Thông tin bắt buộc không có tiếng Anh: 25%; Thiếu hoặc sai khối lượng tịnh: 25%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 19%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-EGG-PLANT-FRUIT-USED-AS-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: Cà tím",
   "text": "Nhóm FDA: EGG PLANT (FRUIT USED AS VEGETABLE)\nTên tiếng Việt: Cà tím\nTừ khóa: cà tím, cà\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 15; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 27%; Có chất bảo quản hóa học nhưng nhãn không ghi: 13%; Dư lượng thuốc bảo vệ thực vật: 13%; Mất vệ sinh do kiểm soát quy trình không đầy đủ: 13%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BARRAMUNDI",
   "title": "Nhóm sản phẩm FDA: Cá chẽm",
   "text": "Nhóm FDA: BARRAMUNDI\nTên tiếng Việt: Cá chẽm\nTừ khóa: cá chẽm\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 14; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 86%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 14%; Thiếu tên thông dụng của sản phẩm: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LEMON-CITRUS-",
   "title": "Nhóm sản phẩm FDA: Chanh (quả)",
   "text": "Nhóm FDA: LEMON (CITRUS)\nTên tiếng Việt: Chanh (quả)\nTừ khóa: chanh, chanh tươi\nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 12; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 50%; Phụ gia thực phẩm không được phép: 17%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 17%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 17%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-IMITATION-MILK-OR-MILK-TYPE-PRODUCT-N-E",
   "title": "Nhóm sản phẩm FDA: Sản phẩm thay thế sữa (sữa thực vật...)",
   "text": "Nhóm FDA: IMITATION MILK OR MILK TYPE PRODUCT, N.E.C.\nTên tiếng Việt: Sản phẩm thay thế sữa (sữa thực vật...)\nTừ khóa: sữa thực vật, sữa hạt, sản phẩm giống sữa\nNgành: Sản phẩm thay thế sữa\nSố dòng từ chối toàn cầu: 11; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 73%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 36%; Thiếu hoặc sai danh sách thành phần: 9%; Thiếu hoặc sai khối lượng tịnh: 9%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 9%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MANGO-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Xoài sấy hoặc dạng nhão",
   "text": "Nhóm FDA: MANGO, DRIED OR PASTE\nTên tiếng Việt: Xoài sấy hoặc dạng nhão\nTừ khóa: xoài sấy, xoài khô, xoài dẻo\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 11; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 27%; Thông tin bắt buộc thiếu tính nổi bật / dễ đọc (không kết luận liên quan màu): 27%; 2040: 18%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 18%; Dư lượng thuốc bảo vệ thực vật: 9%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MIXED-ASSORTED-SOFT-CANDY-WITHOUT-NUTS-",
   "title": "Nhóm sản phẩm FDA: Kẹo mềm hỗn hợp (không hạt, trái cây, sô cô la)",
   "text": "Nhóm FDA: MIXED/ASSORTED SOFT CANDY WITHOUT NUTS, FRUIT OR CHOCOLATE)\nTên tiếng Việt: Kẹo mềm hỗn hợp (không hạt, trái cây, sô cô la)\nTừ khóa: kẹo mềm, kẹo dẻo\nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 10; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 70%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 20%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 20%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 10%; Thông tin bắt buộc thiếu tính nổi bật / dễ đọc (không kết luận liên quan màu): 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SHALLOT-ONION-ROOT-TUBER-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: Hành tím (củ)",
   "text": "Nhóm FDA: SHALLOT (ONION) (ROOT & TUBER VEGETABLE)\nTên tiếng Việt: Hành tím (củ)\nTừ khóa: hành tím, củ hành tím, shallot\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 10; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 40%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 40%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 10%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 10%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SUBTROPICAL-AND-TROPICAL-FRUIT-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Trái cây nhiệt đới / cận nhiệt đới khác",
   "text": "Nhóm FDA: SUBTROPICAL AND TROPICAL FRUIT, N.E.C.\nTên tiếng Việt: Trái cây nhiệt đới / cận nhiệt đới khác\nTừ khóa: trái cây nhiệt đới, trái cây\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 9; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 78%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 11%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 11%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 11%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 11%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MUSHROOM-COMMON-AGARICUS-BISPORUS-FU",
   "title": "Nhóm sản phẩm FDA: Nấm mỡ, sản phẩm nấm khác",
   "text": "Nhóm FDA: MUSHROOM, COMMON (AGARICUS BISPORUS), FUNGI PRODUCTS, N.E.C.\nTên tiếng Việt: Nấm mỡ, sản phẩm nấm khác\nTừ khóa: nấm mỡ, nấm button\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 7; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 29%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 29%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 29%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 29%; Dư lượng thuốc bảo vệ thực vật: 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-THREADFIN",
   "title": "Nhóm sản phẩm FDA: Cá nhụ (threadfin)",
   "text": "Nhóm FDA: THREADFIN\nTên tiếng Việt: Cá nhụ (threadfin)\nTừ khóa: cá nhụ\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 6; Việt Nam: 2\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 33%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 33%; 2000: 17%; Nhiễm Salmonella: 17%; Thiếu tên thông dụng của sản phẩm: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-EGUSI-SEEDS-SUBSPECIES-OF-THE-WATERMELO",
   "title": "Nhóm sản phẩm FDA: Hạt egusi (hạt dưa), dạng nhão",
   "text": "Nhóm FDA: EGUSI SEEDS (SUBSPECIES OF THE WATERMELON SPECIES) (EDIBLE SEED PASTE)\nTên tiếng Việt: Hạt egusi (hạt dưa), dạng nhão\nTừ khóa: hạt egusi, hạt dưa\nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 5; Việt Nam: 2\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai khối lượng tịnh: 40%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 40%; 319: 20%; Công bố dinh dưỡng/sức khỏe chưa được phép: 20%; Không đạt tiêu chuẩn định danh của sản phẩm: 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MUD-FISH",
   "title": "Nhóm sản phẩm FDA: Cá mudfish (cá bùn, cần xác nhận loài)",
   "text": "Nhóm FDA: MUD FISH\nTên tiếng Việt: Cá mudfish (cá bùn, cần xác nhận loài)\nTừ khóa: cá bùn, mudfish\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 4; Việt Nam: 2\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 50%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 50%; Thiếu hoặc sai khối lượng tịnh: 50%; Thông tin bắt buộc không có tiếng Anh: 50%; Thiếu tên thông dụng của sản phẩm: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SHRIMP-SAUCE-FISHERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: Mắm tôm / nước chấm từ tôm",
   "text": "Nhóm FDA: SHRIMP SAUCE, FISHERY PRODUCTS, N.E.C.\nTên tiếng Việt: Mắm tôm / nước chấm từ tôm\nTừ khóa: mắm tôm, mắm ruốc\nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 4; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-DRAGON-FRUIT-SUBTROPICAL-AND-TROPICAL-F",
   "title": "Nhóm sản phẩm FDA: Thanh long sấy hoặc dạng nhão",
   "text": "Nhóm FDA: DRAGON FRUIT, SUBTROPICAL AND TROPICAL FRUIT, DRIED OR PASTE\nTên tiếng Việt: Thanh long sấy hoặc dạng nhão\nTừ khóa: thanh long sấy, thanh long khô\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GRASS-JELLY-GELATIN-PRODUCT-",
   "title": "Nhóm sản phẩm FDA: Thạch sương sáo",
   "text": "Nhóm FDA: GRASS JELLY (GELATIN PRODUCT)\nTên tiếng Việt: Thạch sương sáo\nTừ khóa: sương sáo, thạch đen\nNgành: Thạch, gelatin\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 67%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-JUTE-LEAF-MICROGREEN-",
   "title": "Nhóm sản phẩm FDA: Rau đay (rau non)",
   "text": "Nhóm FDA: JUTE LEAF (MICROGREEN)\nTên tiếng Việt: Rau đay (rau non)\nTừ khóa: rau đay\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 33%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 33%; Thiếu hoặc sai danh sách thành phần: 33%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MUSHROOM-STRAW-PIECES-AND-STEMS-SLICE",
   "title": "Nhóm sản phẩm FDA: Nấm rơm cắt lát, miếng",
   "text": "Nhóm FDA: MUSHROOM, STRAW, PIECES AND STEMS, SLICED\nTên tiếng Việt: Nấm rơm cắt lát, miếng\nTừ khóa: nấm rơm cắt, nấm rơm lát\nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 67%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PAPAYA-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Đu đủ sấy hoặc dạng nhão",
   "text": "Nhóm FDA: PAPAYA, DRIED OR PASTE\nTên tiếng Việt: Đu đủ sấy hoặc dạng nhão\nTừ khóa: đu đủ sấy, đu đủ khô\nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 67%; Công bố dinh dưỡng/sức khỏe chưa được phép: 33%; 2300: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOURSOP-OTHER-FRUIT-PRODUCTS-",
   "title": "Nhóm sản phẩm FDA: Mãng cầu xiêm (sản phẩm khác)",
   "text": "Nhóm FDA: SOURSOP (OTHER FRUIT PRODUCTS)\nTên tiếng Việt: Mãng cầu xiêm (sản phẩm khác)\nTừ khóa: mãng cầu xiêm\nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 67%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SUGAR-CANE-JUICE-OR-DRINK-LEAF-STEM-",
   "title": "Nhóm sản phẩm FDA: Nước mía",
   "text": "Nhóm FDA: SUGAR CANE, JUICE OR DRINK (LEAF & STEM VEGETABLE)\nTên tiếng Việt: Nước mía\nTừ khóa: nước mía, nước ép mía\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 3; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 67%; Nhãn sai hoặc gây hiểu lầm: 67%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 33%; Thiếu hoặc sai khối lượng tịnh: 33%; Thông tin bắt buộc không có tiếng Anh: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BEAN-CURD-PASTE-PACKAGE-CONTAINS-SEPAR",
   "title": "Nhóm sản phẩm FDA: Tương đậu hũ (gói cần pha trộn / nấu)",
   "text": "Nhóm FDA: BEAN CURD PASTE, (PACKAGE CONTAINS SEPARATE COMPONENTS REQUIRING MIXING AND/OR COOKING FOR PREP)\nTên tiếng Việt: Tương đậu hũ (gói cần pha trộn / nấu)\nTừ khóa: chao, đậu hũ lên men, tương đậu\nNgành: Sốt và món ăn chế biến sẵn\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 100%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CANDY-COSMETICS-WITHOUT-CHOCOLATE-",
   "title": "Nhóm sản phẩm FDA: Kẹo hình mỹ phẩm (không sô cô la)",
   "text": "Nhóm FDA: CANDY COSMETICS (WITHOUT CHOCOLATE)\nTên tiếng Việt: Kẹo hình mỹ phẩm (không sô cô la)\nTừ khóa: kẹo đồ chơi, kẹo hình son\nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Cần xác nhận\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CUCUMBERS-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Dưa chuột sấy hoặc dạng nhão",
   "text": "Nhóm FDA: CUCUMBERS, DRIED OR PASTE\nTên tiếng Việt: Dưa chuột sấy hoặc dạng nhão\nTừ khóa: dưa chuột, dưa leo, dưa chuột sấy\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-OKRA-MICROGREEN-",
   "title": "Nhóm sản phẩm FDA: Đậu bắp (rau non)",
   "text": "Nhóm FDA: OKRA (MICROGREEN)\nTên tiếng Việt: Đậu bắp (rau non)\nTừ khóa: đậu bắp\nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOURSOP-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: Mãng cầu xiêm sấy hoặc dạng nhão",
   "text": "Nhóm FDA: SOURSOP, DRIED OR PASTE\nTên tiếng Việt: Mãng cầu xiêm sấy hoặc dạng nhão\nTừ khóa: mãng cầu xiêm sấy\nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOURSOP-JAM-JELLY-PRESERVES-MARMALAD",
   "title": "Nhóm sản phẩm FDA: Mãng cầu xiêm: mứt, thạch, ngâm đường",
   "text": "Nhóm FDA: SOURSOP, JAM, JELLY, PRESERVES, MARMALADE, BUTTER OR CANDIED\nTên tiếng Việt: Mãng cầu xiêm: mứt, thạch, ngâm đường\nTừ khóa: mãng cầu xiêm, mứt mãng cầu\nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 50%; Thông tin bắt buộc không có tiếng Anh: 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-WATERMELON-JUICE-VINE-FRUIT-JUICES-OR-",
   "title": "Nhóm sản phẩm FDA: Nước ép dưa hấu",
   "text": "Nhóm FDA: WATERMELON, JUICE, VINE FRUIT JUICES OR CONCENTRATES\nTên tiếng Việt: Nước ép dưa hấu\nTừ khóa: nước dưa hấu, nước ép dưa hấu\nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 2; Việt Nam: 2\nTình trạng nhóm: Bản nháp\nLỗi thường gặp (toàn cầu): Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 100%; 48: 50%; Thông tin bắt buộc không nổi bật / khó đọc: 50%; Thiếu hoặc sai khối lượng tịnh: 50%; Thiếu hoặc sai danh sách thành phần: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CANDY-SPECIALTIES-N-E-C-WITHOUT-CHOCO",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CANDY SPECIALTIES, N.E.C. (WITHOUT CHOCOLATE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 446; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 40%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 26%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 19%; Thiếu hoặc sai danh sách thành phần: 15%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CANDY-WITHOUT-CHOCOLATE-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CANDY WITHOUT CHOCOLATE N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 287; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%; Phẩm màu không an toàn / không được phép: 47%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 32%; Thiếu hoặc sai khối lượng tịnh: 30%; Thiếu hoặc sai danh sách thành phần: 23%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PEPPER-HOT-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PEPPER, HOT, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 200; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 82%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 7%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 4%; Thông tin bắt buộc không có tiếng Anh: 4%; Thiếu hoặc sai danh sách thành phần: 2%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MIXED-SPICE-AND-SEASONINGS-GROUND-CRAC",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: MIXED SPICE AND SEASONINGS, GROUND, CRACKED, WITHOUT SALT, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 183; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 45%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 26%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 24%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 19%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 13%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CAPSICUMS-CAYENNE-CHILI-HOT-PEPPERS-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CAPSICUMS (CAYENNE CHILI, HOT PEPPERS), GROUND, CRACKED (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 167; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 54%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 22%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 17%; Dư lượng thuốc bảo vệ thực vật: 10%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MIXED-SPICES-AND-SEASONING-WITH-SALT-N-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: MIXED SPICES AND SEASONING WITH SALT, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 160; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 24%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 23%; Nhiễm Salmonella: 19%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 16%; 3910: 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CARBONATED-SOFT-DRINK-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CARBONATED SOFT DRINK, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 144; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 38%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 33%; Thiếu hoặc sai khối lượng tịnh: 31%; Thiếu hoặc sai danh sách thành phần: 27%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CHINESE-RED-DATE-JUJUBES-ZIZIPHUS-JUJU",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CHINESE RED DATE (JUJUBES, ZIZIPHUS JUJUBA), DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 134; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 96%; Dư lượng thuốc bảo vệ thực vật: 4%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 1%; Nhãn sai hoặc gây hiểu lầm: 1%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-HARD-CANDY-WITHOUT-NUTS-AND-FRUIT-N-E-C",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: HARD CANDY WITHOUT NUTS AND FRUIT, N.E.C. (WITHOUT CHOCOLATE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 123; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 46%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 30%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 26%; Thiếu hoặc sai khối lượng tịnh: 20%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 18%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FISH-CAKES-BALLS-ETC-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FISH CAKES, BALLS, ETC., N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 118; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Listeria monocytogenes: 89%; 2000: 8%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 2%; Thông tin bắt buộc không nổi bật / khó đọc: 1%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 1%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FLAVORED-CANDY-HARD-LIVE-SAVERS-ETC-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FLAVORED CANDY, HARD (LIVE SAVERS, ETC.), WITHOUT NUTS AND FRUIT (WITHOUT CHOCOLATE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 110; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 46%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 25%; Thiếu hoặc sai danh sách thành phần: 22%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 10%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PEPPER-SAUCE-HOT-MILD-ETC-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PEPPER SAUCE (HOT, MILD, ETC.)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước chấm và đồ chấm\nSố dòng từ chối toàn cầu: 107; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 41%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 36%; Thiếu hoặc sai khối lượng tịnh: 26%; Thiếu tên thông dụng của sản phẩm: 22%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 21%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GELATIN-FLAVORED",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: GELATIN, FLAVORED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thạch, gelatin\nSố dòng từ chối toàn cầu: 97; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Không phù hợp làm thực phẩm: 57%; Phẩm màu không an toàn / không được phép: 26%; Thiếu hoặc sai danh sách thành phần: 8%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 8%; Thông tin bắt buộc không có tiếng Anh: 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TEA-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: TEA, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Cà phê và trà\nSố dòng từ chối toàn cầu: 90; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 47%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 37%; Thiếu hoặc sai khối lượng tịnh: 27%; Thông tin bắt buộc không nổi bật / khó đọc: 17%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SPICES-GROUND-CRACKED-ETC-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SPICES, GROUND, CRACKED, ETC., N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 86; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 34%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 27%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 20%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 10%; Thiếu hoặc sai danh sách thành phần: 7%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-DRINK-SUBTROPICAL-OR-TROPICAL-FRUI",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT DRINK, SUBTROPICAL OR TROPICAL FRUIT FLAVORED, CARBONATED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 77; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 42%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 29%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 26%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Thông tin bắt buộc không có tiếng Anh: 19%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CORIANDER-GROUND-CRACKED-SPICE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CORIANDER, GROUND, CRACKED (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 76; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 75%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 29%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 26%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 5%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 4%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-DRINKS-AND-WATERS-NOT-MENTIONED-ELS",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT DRINKS AND WATERS NOT MENTIONED ELSEWHERE, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 70; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 44%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 43%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 20%; Thông tin bắt buộc không có tiếng Anh: 16%; Chứa melamine: 11%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TOMATO-SAUCE-WITH-OTHER-INGREDIENTS-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: TOMATO SAUCE (WITH OTHER INGREDIENTS)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Sốt và món ăn chế biến sẵn\nSố dòng từ chối toàn cầu: 70; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 43%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 16%; Phẩm màu không an toàn / không được phép: 13%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 13%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TEA-GREEN",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: TEA, GREEN\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Cà phê và trà\nSố dòng từ chối toàn cầu: 69; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Mất vệ sinh do kiểm soát quy trình không đầy đủ: 22%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 20%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 19%; Thiếu hoặc sai danh sách thành phần: 17%; 3260: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SWEET-GOODS-WITHOUT-CUSTARD-OR-CREAM-FIL",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SWEET GOODS WITHOUT CUSTARD OR CREAM FILLING, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 57; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai khối lượng tịnh: 23%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 21%; Thông tin bắt buộc không có tiếng Anh: 18%; Phẩm màu không an toàn / không được phép: 16%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 16%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-VEGETABLE-PROTEIN-PRODUCTS-NOT-ELSEWHERE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: VEGETABLE PROTEIN PRODUCTS NOT ELSEWHERE MENTIONED, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Sản phẩm protein thực vật\nSố dòng từ chối toàn cầu: 53; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chứa melamine: 62%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 17%; Không phù hợp làm thực phẩm: 11%; Thiếu hoặc sai danh sách thành phần: 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TURMERIC-GROUND-CRACKED-SPICE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: TURMERIC, GROUND, CRACKED (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 51; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 57%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 29%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 24%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 6%; Bị coi là thuốc mới chưa phê duyệt: 6%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CINNAMON-CASSIA-WHOLE-SPICE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CINNAMON, CASSIA, WHOLE (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 47; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 43%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 19%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 19%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 19%; Nhiễm Salmonella: 13%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-DRINK-OTHER-FRUIT-FLAVORED-CARBON",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT DRINK, OTHER FRUIT FLAVORED, CARBONATED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 42; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 62%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 48%; Thông tin bắt buộc không có tiếng Anh: 38%; Thiếu hoặc sai danh sách thành phần: 33%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 31%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-CANDY-WITH-FRUIT-N-E-C-WITHOUT-C",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT CANDY WITH FRUIT, N.E.C. (WITHOUT CHOCOLATE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 41; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 34%; Thông tin bắt buộc không nổi bật / khó đọc: 29%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 22%; Phẩm màu không an toàn / không được phép: 22%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FLUID-DRY-MILK-PRODUCTS-NOT-ELSEWHERE-ME",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FLUID/DRY MILK PRODUCTS NOT ELSEWHERE MENTIONED, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Sữa và sản phẩm từ sữa\nSố dòng từ chối toàn cầu: 40; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 22%; Chứa melamine: 18%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 15%; Thiếu hoặc sai khối lượng tịnh: 15%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-OKRA-FRUIT-USED-AS-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: OKRA (FRUIT USED AS VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 35; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 57%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 29%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 26%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 23%; Thiếu hoặc sai khối lượng tịnh: 6%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-DRINK-BERRY-FRUIT-FLAVORED-CARBON",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT DRINK, BERRY FRUIT FLAVORED, CARBONATED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 35; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 63%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 37%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 29%; Thiếu hoặc sai danh sách thành phần: 23%; Thiếu hoặc sai khối lượng tịnh: 23%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COFFEE-INSTANT",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: COFFEE, INSTANT\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Cà phê và trà\nSố dòng từ chối toàn cầu: 28; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 36%; Thiếu hoặc sai khối lượng tịnh: 32%; Thông tin bắt buộc không có tiếng Anh: 21%; Thông tin bắt buộc không nổi bật / khó đọc: 21%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 18%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CEREAL-PREPARATIONS-NOT-ELSEWHERE-MENTIO",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CEREAL PREPARATIONS NOT ELSEWHERE MENTIONED, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Ngũ cốc chế biến khác\nSố dòng từ chối toàn cầu: 21; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 52%; Thiếu hoặc sai khối lượng tịnh: 43%; Thông tin bắt buộc không có tiếng Anh: 24%; Thiếu hoặc sai danh sách thành phần: 14%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-EEL-AQUACULTURE-HARVESTED-FISHERY-SEAFO",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: EEL, AQUACULTURE HARVESTED FISHERY/SEAFOOD PRODUCTS\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 21; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 95%; Phụ gia thực phẩm không được phép: 43%; Nhiễm Listeria monocytogenes: 5%; Thông tin bắt buộc không có tiếng Anh: 5%; Thông tin bắt buộc không nổi bật / khó đọc: 5%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FRUIT-FRUIT-FLAVORED-PLAIN-COOKIES-BISC",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FRUIT/FRUIT FLAVORED PLAIN COOKIES, BISCUITS AND WAFERS\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 20; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 55%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 15%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 15%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 15%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PERSIMMON-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PERSIMMON, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 19; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 100%; 2040: 5%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CARROT-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CARROT, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 18; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 94%; Thiếu hoặc sai khối lượng tịnh: 6%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 6%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-SUBTROPICAL-AND-TROPICAL-FRUIT-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: COCONUT, SUBTROPICAL AND TROPICAL FRUIT, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 17; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 59%; Thông tin bắt buộc không có tiếng Anh: 24%; Thông tin bắt buộc không nổi bật / khó đọc: 6%; Thiếu hoặc sai danh sách thành phần: 6%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 6%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-STRAWBERRIES-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: STRAWBERRIES, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 17; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 59%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 18%; Phẩm màu không an toàn / không được phép: 12%; Thông tin bắt buộc không có tiếng Anh: 12%; Cơ sở nước ngoài từ chối cho FDA thanh tra: 12%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FOOD-PACK-REQUIR-MIX-COOK-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FOOD PACK REQUIR MIX/COOK, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Sốt và món ăn chế biến sẵn\nSố dòng từ chối toàn cầu: 16; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 31%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 31%; Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 31%; Thiếu hoặc sai danh sách thành phần: 25%; Thiếu hoặc sai khối lượng tịnh: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BAMBOO-SHOOTS-LEAF-STEM-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: BAMBOO SHOOTS (LEAF & STEM VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 12; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 50%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 25%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Thiếu hoặc sai khối lượng tịnh: 17%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-STICKS",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: RICE STICKS\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Mì, bún và ngũ cốc chế biến\nSố dòng từ chối toàn cầu: 12; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 67%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 17%; Thông tin bắt buộc không có tiếng Anh: 8%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 8%; Mất vệ sinh do kiểm soát quy trình không đầy đủ: 8%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SWEET-POTATO-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SWEET POTATO, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 12; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 33%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Thông tin bắt buộc không có tiếng Anh: 17%; Thiếu hoặc sai danh sách thành phần: 17%; Không khai báo đủ chất gây dị ứng chính: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SNAKE-HEAD",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SNAKE HEAD\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 10; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 70%; Nhiễm Salmonella: 10%; Bị coi là thuốc mới chưa phê duyệt: 10%; Dấu hiệu vi phạm về dư lượng thuốc thú y (cần xác định chất): 10%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MUSHROOM-COMMON-AGARICUS-BISPORUS-PI",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: MUSHROOM, COMMON (AGARICUS BISPORUS), PIECES AND STEMS, SLICED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 8; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 75%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-OTHER-FRUIT-AND-FRUIT-PRODUCTS-DRIED-AN",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: OTHER FRUIT AND FRUIT PRODUCTS, DRIED AND PASTE, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 8; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 38%; 3897: 25%; Thiếu hoặc sai khối lượng tịnh: 25%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 12%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-POTATO-CHIPS-BAKED",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: POTATO CHIPS,BAKED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Snack\nSố dòng từ chối toàn cầu: 8; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 62%; Chứa melamine: 25%; Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 12%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 12%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 12%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-FLAKES-PAPER",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: RICE FLAKES/PAPER\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Mì, bún và ngũ cốc chế biến\nSố dòng từ chối toàn cầu: 8; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Cơ sở nước ngoài từ chối cho FDA thanh tra: 75%; 3600: 38%; Thông tin bắt buộc không có tiếng Anh: 12%; Chứa melamine: 12%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-SUBTROPICAL-AND-TROPICAL-FRUIT",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: COCONUT, SUBTROPICAL AND TROPICAL FRUIT\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 7; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Mất vệ sinh do kiểm soát quy trình không đầy đủ: 43%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 14%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 14%; Nhiễm Salmonella: 14%; Có thể bị nhiễm bẩn do điều kiện mất vệ sinh: 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-EDIBLE-BIRD-S-NEST-READY-TO-EAT-MULTIP",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: EDIBLE BIRD'S NEST, READY-TO-EAT (MULTIPLE FOOD SPECIALTIES, SIDE DISHES & DESSERTS)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Sốt và món ăn chế biến sẵn\nSố dòng từ chối toàn cầu: 7; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 86%; Thiếu hoặc sai danh sách thành phần: 14%; Thiếu hoặc sai khối lượng tịnh: 14%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 14%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FISHERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FISHERY PRODUCTS, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 7; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 29%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 29%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 14%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 14%; Nhiễm Salmonella: 14%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MIXED-FRUIT-DRIED-OR-PASTE-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: MIXED FRUIT, DRIED OR PASTE, N.E.C.,\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 7; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 57%; Thiếu hoặc sai danh sách thành phần: 29%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 29%; Thiếu hoặc sai khối lượng tịnh: 29%; Thiếu tên thông dụng của sản phẩm: 29%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FILEFISH",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FILEFISH\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 6; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 67%; Nhiễm Salmonella: 17%; Cơ sở nước ngoài từ chối cho FDA thanh tra: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FUNGUS-BLACK-CLOUD-EARS-PIECES-AND-S",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FUNGUS, BLACK (CLOUD EARS), PIECES AND STEMS, SLICED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 6; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 67%; Dư lượng thuốc bảo vệ thực vật: 17%; Nhiễm Salmonella: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LEAF-STEM-VEGETABLES-WITH-SAUCE-N-E-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: LEAF & STEM VEGETABLES, WITH SAUCE, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 6; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 50%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%; 3887: 33%; Thiếu hoặc sai danh sách thành phần: 17%; 2040: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RICE-BROWN-PROCESSED-PACKAGED-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: RICE, BROWN, PROCESSED (PACKAGED)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gạo, ngũ cốc nguyên hạt và tinh bột\nSố dòng từ chối toàn cầu: 6; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 50%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 33%; Thiếu tên thông dụng của sản phẩm: 17%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-DRINK-MIXED-FRUIT-FLAVORED-NONCAR",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT DRINK, MIXED FRUIT FLAVORED, NONCARBONATED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 6; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 67%; Thiếu hoặc sai khối lượng tịnh: 50%; Thiếu hoặc sai danh sách thành phần: 33%; Phẩm màu không an toàn / không được phép: 33%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-WATER-CHESTNUT-ROOT-TUBER-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: WATER CHESTNUT (ROOT & TUBER VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 6; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chuẩn bị/đóng gói/lưu giữ trong điều kiện mất vệ sinh có thể gây hại: 50%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 33%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 17%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 17%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-SUBTROPICAL-AND-TROPICAL-FRUIT-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: COCONUT, SUBTROPICAL AND TROPICAL FRUIT PULP\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 5; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): 3460: 40%; Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 40%; Nhiễm Salmonella: 20%; Sản xuất, chế biến hoặc đóng gói trong điều kiện mất vệ sinh: 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-SUBTROPICAL-AND-TROPICAL-FRUIT-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: COCONUT, SUBTROPICAL AND TROPICAL FRUIT, JAMS, JELLIES, PRESERVES, MARMALADES, CANDIED, BUTTERS, SPR\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 5; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 40%; Thiếu hoặc sai danh sách thành phần: 20%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 20%; Thiếu hoặc sai khối lượng tịnh: 20%; Thiếu tên thông dụng của sản phẩm: 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-DRAGON-FRUIT-SUBTROPICAL-AND-TROPICAL-F",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: DRAGON FRUIT, SUBTROPICAL AND TROPICAL FRUIT\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 5; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 80%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 20%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BAMBOO-SHOOTS-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: BAMBOO SHOOTS, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%; Mất vệ sinh do kiểm soát quy trình không đầy đủ: 50%; Dư lượng thuốc bảo vệ thực vật: 25%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-BANANA-BLOSSOMS-LEAF-STEM-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: BANANA BLOSSOMS (LEAF & STEM VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CASSAVA-BREADED",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CASSAVA, BREADED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 75%; Dư lượng thuốc bảo vệ thực vật: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GUAVA-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: GUAVA, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 75%; Thiếu tên thông dụng của sản phẩm: 50%; Thông tin bắt buộc không có tiếng Anh: 50%; Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 25%; Thiếu hoặc sai khối lượng tịnh: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LUMPIA-WRAPPERS-INCLUDES-PASTRY-WRAPPER",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: LUMPIA WRAPPERS (INCLUDES PASTRY WRAPPERS AND SHEETS)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 75%; Thiếu hoặc sai danh sách thành phần: 25%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 25%; Thiếu hoặc sai khối lượng tịnh: 25%; Thông tin bắt buộc không có tiếng Anh: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PINEAPPLE-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PINEAPPLE, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 25%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 25%; Thiếu hoặc sai danh sách thành phần: 25%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 25%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SEAWEED-LEAF-STEM-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SEAWEED (LEAF & STEM VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 50%; Thiếu hoặc sai danh sách thành phần: 25%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 25%; Thông tin bắt buộc không có tiếng Anh: 25%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOFT-DRINK-BERRY-FRUIT-FLAVORED-NONCAR",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOFT DRINK, BERRY FRUIT FLAVORED, NONCARBONATED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 4; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 75%; Thiếu hoặc sai khối lượng tịnh: 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%; 258: 25%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 25%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CAVIAR-FISHERY-PRODUCTS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CAVIAR, FISHERY PRODUCTS, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 3; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Vi phạm quy định HACCP thủy sản: 67%; Nhãn sai hoặc gây hiểu lầm: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-ENZYMES-FOOD-ADDITIVES-FOR-HUMAN-USE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: ENZYMES (FOOD ADDITIVES FOR HUMAN USE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Phụ gia thực phẩm\nSố dòng từ chối toàn cầu: 3; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 100%; Thiếu hoặc sai danh sách thành phần: 33%; Thiếu hoặc sai khối lượng tịnh: 33%; Thiếu tên thông dụng của sản phẩm: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PANDANUS-LEAF-NATURAL-EXTRACT-OR-FLAVOR",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PANDANUS LEAF, NATURAL EXTRACT OR FLAVOR (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 3; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 67%; 3910: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PREPARED-DRY-SWEET-GOODS-MIX-WITHOUT-CUS",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PREPARED DRY SWEET GOODS MIX WITHOUT CUSTARD OR CREAM FILLING N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 3; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 33%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 33%; Nhãn sai hoặc gây hiểu lầm: 33%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 33%; Thông tin bắt buộc không có tiếng Anh: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SMELT",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SMELT\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 3; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOYBEANS-MICROGREEN-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOYBEANS (MICROGREEN)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 3; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 33%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 33%; Cơ sở nước ngoài từ chối cho FDA thanh tra: 33%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CASHEW-IN-SHELL",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CASHEW, IN SHELL\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 50%; Thiếu hoặc sai danh sách thành phần: 50%; Thiếu hoặc sai khối lượng tịnh: 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CHIVES-ROOT-TUBER-VEGETABLE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CHIVES (ROOT & TUBER VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Dư lượng thuốc bảo vệ thực vật: 50%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-COCONUT-IN-SHELL",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: COCONUT, IN SHELL\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Hạt và hạt ăn được\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-DOUGHNUT-WITHOUT-CUSTARD-OR-CREAM-FILLIN",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: DOUGHNUT WITHOUT CUSTARD OR CREAM FILLING\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 100%; Thiếu hoặc sai danh sách thành phần: 50%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 50%; Thiếu hoặc sai khối lượng tịnh: 50%; Có phẩm màu FD&C Yellow No. 5 nhưng không khai báo: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-ENERGY-DRINK-CAFFEINE-FREE-CARBONATED-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: ENERGY DRINK CAFFEINE-FREE, CARBONATED, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Có phẩm màu nhân tạo nhưng nhãn không ghi: 50%; Thông tin bắt buộc không có tiếng Anh: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-LEMON-GRASS-GROUND-CRACKED-SPICE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: LEMON GRASS, GROUND, CRACKED (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhà nhập khẩu vi phạm chương trình xác minh nhà cung cấp nước ngoài (FSVP): 50%; Nhiễm Salmonella: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PASSION-FRUIT-SUBTROPICAL-AND-TROPICAL-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PASSION FRUIT (SUBTROPICAL AND TROPICAL FRUIT PUREES)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 50%; Có phẩm màu nhân tạo nhưng nhãn không ghi: 50%; Thiếu hoặc sai khối lượng tịnh: 50%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 50%; Thông tin bắt buộc thiếu tính nổi bật / dễ đọc (không kết luận liên quan màu): 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TREVALLY",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: TREVALLY\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 2; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 50%; Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 50%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-APRICOT-PIT-FRUIT-PUREES-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: APRICOT (PIT FRUIT PUREES)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CHIVES-MICROGREEN-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CHIVES (MICROGREEN)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CITRUS-FLAVORED-IMITATION-FRUIT-JAM-JE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CITRUS FLAVORED IMITATION FRUIT, JAM, JELLY, PRESERVES, MARMALADE, BUTTER OR CANDIED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 100%; Thiếu hoặc sai khối lượng tịnh: 100%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-CRUSTACEANS-N-E-C-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: CRUSTACEANS, N.E.C.\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-FLAVORED-CANDY-HARD-LIVE-SAVERS-ETC-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: FLAVORED CANDY, HARD (LIVE SAVERS, ETC.), WITH COCONUT (WITHOUT CHOCOLATE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 100%; Vi phạm luật đóng gói và ghi nhãn (FPLA): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GOOSEBERRY-JAM-JELLY-PRESERVES-MARMA",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: GOOSEBERRY, JAM, JELLY, PRESERVES, MARMALADE, BUTTER AND CANDIED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Bẩn, thối rữa, hoặc không phù hợp làm thực phẩm: 100%; Thông tin bắt buộc không có tiếng Anh: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-GREEN-PEPPERCORN-WHOLE-SPICE-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: GREEN PEPPERCORN, WHOLE (SPICE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Gia vị\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-IMITATION-BIRD-S-NEST-SOFT-DRINK-NONCAR",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: IMITATION BIRD'S NEST SOFT DRINK, NONCARBONATED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Nước giải khát\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 100%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-JACKFRUIT-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: JACKFRUIT, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhãn sai hoặc gây hiểu lầm: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-KUMQUAT-CITRUS-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: KUMQUAT (CITRUS)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phụ gia thực phẩm không được phép: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-KUMQUAT-CITRUS-FRUIT-JUICES-OR-CONCENTR",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: KUMQUAT, CITRUS FRUIT JUICES OR CONCENTRATES\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 100%; Nhãn sai hoặc gây hiểu lầm: 100%; Thông tin bắt buộc không có tiếng Anh: 100%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-KUMQUAT-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: KUMQUAT, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MIXED-PREPARED-DRY-COOKIE-MIX-WITH-MILK-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: MIXED PREPARED DRY COOKIE MIX WITH MILK OR EGG\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Bánh nướng\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 100%; Thiếu hoặc sai danh sách thành phần: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-MIXED-ASSORTED-SOFT-CANDY-WITH-NUTS-NUT",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: MIXED/ASSORTED SOFT CANDY WITH NUTS, NUT PRODUCTS, OR SEEDS W/O COCONUT OR CHOCOLATE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Kẹo (không sô cô la)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thiếu hoặc sai danh sách thành phần: 100%; Thiếu hoặc sai khối lượng tịnh: 100%; Thông tin bắt buộc không có tiếng Anh: 100%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 100%; Không khai báo đủ chất gây dị ứng chính: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-NOODLES-LO-MEIN",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: NOODLES, LO MEIN\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Mì, bún và ngũ cốc chế biến\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Phẩm màu không an toàn / không được phép: 100%; Thiếu hoặc sai danh sách thành phần: 100%; Thiếu tên và địa chỉ nhà sản xuất/đóng gói/phân phối: 100%; Thiếu hoặc sai khối lượng tịnh: 100%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-OCTOPUS-CAKES-BALLS-ETC-OTHER-AQUAT",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: OCTOPUS, CAKES, BALLS, ETC., OTHER AQUATIC SPECIES\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Thủy sản\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Listeria monocytogenes: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-PASSION-FRUIT-DRIED-OR-PASTE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: PASSION FRUIT, DRIED OR PASTE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây nhiệt đới / cận nhiệt đới và chế phẩm\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 100%; Thiếu bảng thông tin dinh dưỡng (Nutrition Facts): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-RAISIN-JAM-JELLY-PRESERVES-MARMALADE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: RAISIN, JAM, JELLY, PRESERVES, MARMALADE, BUTTER AND CANDIED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOURSOP-OTHER-FRUIT-PUREES-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOURSOP (OTHER FRUIT PUREES)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chứa chất độc hại (chất cụ thể nêu riêng từng lô): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SOURSOP-JUICE-OTHER-FRUIT-JUICES-OR-CO",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SOURSOP, JUICE, OTHER FRUIT JUICES OR CONCENTRATES\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây khác và nước ép\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Cơ sở chưa đăng ký là nhà sản xuất đồ hộp axit thấp/axit hóa: 100%; Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 100%; Thiếu hoặc sai danh sách thành phần: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-STAR-GOOSEBERRY-JAM-JELLY-PRESERVES-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: STAR GOOSEBERRY, JAM, JELLY, PRESERVES, MARMALADE, BUTTER AND CANDIED\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Trái cây (quả, nước ép, chế biến)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Thông tin bắt buộc không có tiếng Anh: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-SUGAR-CANE-DRIED-OR-PASTE-LEAF-STEM-",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: SUGAR CANE, DRIED OR PASTE (LEAF & STEM VEGETABLE)\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Rau (lá, thân, quả dùng như rau, rong biển)\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Nhiễm Salmonella: 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "group-TARO-DASHEEN-WITH-SAUCE",
   "title": "Nhóm sản phẩm FDA: (chưa dịch)",
   "text": "Nhóm FDA: TARO, DASHEEN, WITH SAUCE\nTên tiếng Việt: (chưa dịch)\nTừ khóa: \nNgành: Củ, rễ và nấm\nSố dòng từ chối toàn cầu: 1; Việt Nam: 1\nTình trạng nhóm: Chưa dịch\nLỗi thường gặp (toàn cầu): Chưa nộp quy trình xử lý nhiệt (đồ hộp axit thấp/axit hóa): 100%\nLỗi thường gặp (Việt Nam): quá ít dữ liệu\nKỳ dữ liệu: 10/2021 đến 23/10/2026",
   "source": "FDA Import Refusals – nhóm chuẩn hóa trong data.js"
  },
  {
   "id": "meta-source",
   "title": "Nguồn và phạm vi dữ liệu",
   "text": "Dữ liệu là FDA Import Refusal Report, kỳ 10/2021 đến 23/10/2026, cập nhật đến 23/10/2026. Chưa tích hợp RASFF, EU, Import Alerts hay đọc nội dung COA. Tỷ lệ % là phần dòng bị từ chối của nhóm có mã lỗi đó, không phải xác suất bị từ chối.",
   "source": "data.js"
  },
  {
   "id": "meta-score",
   "title": "Chỉ số ưu tiên rà soát",
   "text": "Từ khóa: điểm, chỉ số, xác suất, ưu tiên rà soát, 0-100. Điểm = tín hiệu lịch sử (tối đa 70) + thiếu hồ sơ (tối đa 30), thang 0–100. Đây là thứ tự ưu tiên rà soát, không phải xác suất bị từ chối và không phải chứng nhận chất lượng. Lô hàng chưa đủ căn cứ để kết luận đạt/không đạt.",
   "source": "engine.js"
  },
  {
   "id": "meta-disclaimer",
   "title": "Phạm vi trách nhiệm",
   "text": "Từ khóa: FDA từ chối, lô hàng bị giữ, tái xuất, tiêu hủy, 90 ngày, tư vấn pháp lý, trách nhiệm, đủ điều kiện nhập khẩu, thông quan. PRECHECK là công cụ hỗ trợ rà soát. Không thay thế quyết định của FDA, kết quả kiểm nghiệm, hay tư vấn pháp lý. Với câu hỏi pháp lý cụ thể, cần chuyên gia QA hoặc tư vấn xuất nhập khẩu xác nhận.",
   "source": "FAQ dashboard"
  },
  {
   "id": "meta-price",
   "title": "Giá dự kiến",
   "text": "Từ khóa: giá, phí, chi phí, bao nhiêu tiền, trả tiền, gói, bảng giá, subscription. Giai đoạn đầu: 199.000đ/báo cáo (1 sản phẩm × 1 thị trường); 499.000đ/tháng tối đa 3 báo cáo. Lộ trình giảm giá (169.000đ, 149.000đ; 449.000đ, 399.000đ) chưa áp dụng. Bản demo không thu tiền. Giá là dự kiến để kiểm chứng qua pilot.",
   "source": "pricing.js"
  },
  {
   "id": "meta-pilot",
   "title": "Pilot 90 ngày",
   "text": "Từ khóa: pilot, thử nghiệm, PRECHECK là gì, KPI, SME, giai đoạn. Mục tiêu 5–10 SME, 20–30 hồ sơ kiểm tra. MVP: hạt điều xuất sang Hoa Kỳ; EU giai đoạn 2. KPI: giảm ≥50% thời gian tra cứu; ≥85% cảnh báo được chuyên gia xác nhận phù hợp; ≥90% hoàn thành checklist; ≥30% SME sẵn sàng trả phí.",
   "source": "poster dự án"
  },
  {
   "id": "meta-finance",
   "title": "Dự báo tài chính",
   "text": "Từ khóa: tài chính, hòa vốn, thu hồi vốn, lợi nhuận, doanh thu, dòng tiền, bao lâu. Ước tính từ mô hình, chưa phải kết quả thực tế: chi phí khởi tạo khoảng 4 triệu đồng; vận hành khoảng 1,7 triệu đồng/tháng; hòa vốn vận hành tháng 10; thu hồi vốn khởi tạo tháng 17.",
   "source": "poster dự án"
  },
  {
   "id": "meta-facility",
   "title": "Đăng ký cơ sở và US Agent",
   "text": "Từ khóa: đăng ký cơ sở, FFR, US Agent, đại diện Mỹ, Prior Notice. Cơ sở nước ngoài xuất thực phẩm sang Mỹ cần đăng ký FDA (FFR), chỉ định đại diện tại Mỹ (US Agent), khai báo trước (Prior Notice). Gia hạn hai năm một lần vào năm chẵn. Xác nhận thời hạn cụ thể với chuyên gia.",
   "source": "bản demo/label engine"
  },
  {
   "id": "meta-fsvp",
   "title": "FSVP",
   "text": "Từ khóa: FSVP, nhà cung cấp, xác minh nhà cung cấp, nhà nhập khẩu. FSVP là chương trình xác minh nhà cung cấp nước ngoài; nghĩa vụ chính thuộc nhà nhập khẩu Mỹ. Chuẩn bị hồ sơ: kế hoạch an toàn thực phẩm, kết quả kiểm nghiệm, chứng nhận cơ sở.",
   "source": "bản demo/label engine"
  },
  {
   "id": "meta-allergen",
   "title": "Chất gây dị ứng ở Mỹ",
   "text": "Từ khóa: dị ứng, hạt cây, chất gây dị ứng, allergen. Mỹ có 9 nhóm chính: sữa, trứng, cá, giáp xác, hạt cây, đậu phộng, lúa mì, đậu nành, mè (mè từ 01/01/2023). Hạt điều thuộc nhóm hạt cây. Cần đánh giá nhiễm chéo nếu dùng chung dây chuyền. EU có 14 nhóm riêng, chưa hỗ trợ.",
   "source": "bản demo/label engine"
  },
  {
   "id": "meta-cashew",
   "title": "Checklist hạt điều (gợi ý)",
   "text": "Từ khóa: hạt điều, aflatoxin, nấm mốc, BVTV, thuốc trừ sâu, dư lượng, Salmonella, kiểm nghiệm, checklist, xuất khẩu. A. Hóa học/vi sinh (w=3): kiểm nghiệm độc tố nấm mốc (aflatoxin) từng lô; dư lượng thuốc BVTV theo giới hạn thị trường đích; Salmonella và vệ sinh chế biến; COA gắn mã lô. B. Nhãn/dị ứng (w=2): khai báo hạt cây; nhãn đúng ngôn ngữ, dinh dưỡng, nhà sản xuất, xuất xứ, hạn dùng; chứng nhận cho tuyên bố như \"hữu cơ\". C. Hồ sơ (w=1): đăng ký cơ sở và US Agent; HACCP hoặc kế hoạch an toàn thực phẩm; truy xuất từ nguyên liệu đến lô; chứng từ thống nhất. Đây là gợi ý, cần đối chiếu quy định hiện hành.",
   "source": "file prompt PRECHECK"
  },
  {
   "id": "meta-score-example",
   "title": "Ví dụ tính điểm",
   "text": "Từ khóa: ví dụ điểm, tính điểm, điểm 38, công thức. Ví dụ: 4 kiểm soát hóa học/vi sinh (w=3), 3 nhãn (w=2), 3 hồ sơ (w=1). Mẫu số = 21. Chưa đáp ứng: 2 hóa học, 1 nhãn, 0 hồ sơ. Tử số = 8. Chỉ số ≈ 38 (trung bình).",
   "source": "file prompt PRECHECK"
  }
 ]
};
const SYSTEM = "B\u1ea1n l\u00e0 **PRECHECK Assistant**, tr\u1ee3 l\u00fd c\u1ee7a n\u1ec1n t\u1ea3ng PRECHECK (\u0111\u1ed9i thi Yuushousha). PRECHECK gi\u00fap doanh nghi\u1ec7p SME Vi\u1ec7t Nam s\u00e0ng l\u1ecdc r\u1ee7i ro tu\u00e2n th\u1ee7 tr\u01b0\u1edbc khi xu\u1ea5t kh\u1ea9u th\u1ef1c ph\u1ea9m sang Hoa K\u1ef3 v\u00e0 EU. S\u1ea3n ph\u1ea9m th\u1eed nghi\u1ec7m \u0111\u1ea7u ti\u00ean (MVP) l\u00e0 h\u1ea1t \u0111i\u1ec1u xu\u1ea5t sang Hoa K\u1ef3 v\u00e0 EU.\n\n### Ng\u00f4n ng\u1eef v\u00e0 gi\u1ecdng \u0111i\u1ec7u\n- Tr\u1ea3 l\u1eddi b\u1eb1ng ti\u1ebfng Vi\u1ec7t, tr\u1eeb khi ng\u01b0\u1eddi d\u00f9ng vi\u1ebft b\u1eb1ng ng\u00f4n ng\u1eef kh\u00e1c.\n- Gi\u1ecdng th\u00e2n thi\u1ec7n, r\u00f5 r\u00e0ng, d\u1ec5 hi\u1ec3u v\u1edbi ch\u1ee7 doanh nghi\u1ec7p nh\u1ecf kh\u00f4ng chuy\u00ean v\u1ec1 ph\u00e1p l\u00fd. Gi\u1ea3i th\u00edch thu\u1eadt ng\u1eef (FDA, RASFF, HACCP, FSVP...) ngay l\u1ea7n \u0111\u1ea7u d\u00f9ng.\n- C\u00e2u tr\u1ea3 l\u1eddi ng\u1eafn g\u1ecdn. D\u00f9ng danh s\u00e1ch khi li\u1ec7t k\u00ea c\u00e1c b\u01b0\u1edbc ho\u1eb7c h\u1ea1ng m\u1ee5c ki\u1ec3m tra.\n\n### Ba nhi\u1ec7m v\u1ee5 ch\u00ednh\n1. **H\u1ecfi \u0111\u00e1p quy \u0111\u1ecbnh FDA/EU:** gi\u1ea3i th\u00edch quy \u0111\u1ecbnh, l\u00fd do l\u00f4 h\u00e0ng b\u1ecb t\u1eeb ch\u1ed1i ho\u1eb7c b\u1ecb c\u1ea3nh b\u00e1o, v\u00e0 c\u00e1c kh\u00e1i ni\u1ec7m li\u00ean quan.\n2. **Ch\u1ea5m \u0111i\u1ec3m \u01b0u ti\u00ean r\u00e0 so\u00e1t:** h\u1ecfi ng\u01b0\u1eddi d\u00f9ng th\u00f4ng tin s\u1ea3n ph\u1ea9m r\u1ed3i t\u00ednh Ch\u1ec9 s\u1ed1 \u01b0u ti\u00ean r\u00e0 so\u00e1t (0\u2013100) theo c\u00f4ng th\u1ee9c trong c\u01a1 s\u1edf ki\u1ebfn th\u1ee9c.\n3. **Checklist h\u00e0nh \u0111\u1ed9ng kh\u1eafc ph\u1ee5c:** \u0111\u01b0a ra c\u00e1c vi\u1ec7c c\u1ea7n l\u00e0m, ng\u01b0\u1eddi ph\u1ee5 tr\u00e1ch g\u1ee3i \u00fd v\u00e0 th\u1ee9 t\u1ef1 \u01b0u ti\u00ean \u0111\u1ec3 gi\u1ea3m r\u1ee7i ro.\n\n### Quy t\u1eafc b\u1eaft bu\u1ed9c\n- **Ch\u1ec9 s\u1ed1 l\u00e0 c\u00f4ng c\u1ee5 \u01b0u ti\u00ean r\u00e0 so\u00e1t, KH\u00d4NG ph\u1ea3i x\u00e1c su\u1ea5t b\u1ecb t\u1eeb ch\u1ed1i** v\u00e0 kh\u00f4ng ph\u1ea3i h\u1ec7 th\u1ed1ng ch\u1ea5m \u0111i\u1ec3m c\u1ee7a FDA hay EU. Lu\u00f4n nh\u1eafc \u0111i\u1ec1u n\u00e0y khi \u0111\u01b0a ra \u0111i\u1ec3m.\n- Kh\u00f4ng kh\u1eb3ng \u0111\u1ecbnh ch\u1eafc ch\u1eafn m\u1ed9t l\u00f4 h\u00e0ng s\u1ebd \u0111\u01b0\u1ee3c th\u00f4ng quan hay b\u1ecb t\u1eeb ch\u1ed1i. D\u00f9ng c\u00e1ch n\u00f3i nh\u01b0 \"m\u1ee9c \u01b0u ti\u00ean r\u00e0 so\u00e1t cao\", \"n\u00ean ki\u1ec3m tra tr\u01b0\u1edbc\".\n- Kh\u00f4ng b\u1ecba s\u1ed1 li\u1ec7u, \u0111i\u1ec1u lu\u1eadt hay m\u00e3 quy \u0111\u1ecbnh. N\u1ebfu kh\u00f4ng ch\u1eafc, n\u00f3i r\u00f5 v\u00e0 h\u01b0\u1edbng ng\u01b0\u1eddi d\u00f9ng \u0111\u1ebfn ngu\u1ed3n ch\u00ednh th\u1ee9c: FDA, RASFF, EUR-Lex, Access2Markets, Codex.\n- V\u1edbi s\u1ed1 li\u1ec7u th\u1ecb tr\u01b0\u1eddng, nh\u1eafc r\u1eb1ng \u0111\u00f3 l\u00e0 s\u1ed1 li\u1ec7u t\u1ea1i th\u1eddi \u0111i\u1ec3m l\u1eadp poster v\u00e0 n\u00ean ki\u1ec3m tra l\u1ea1i ngu\u1ed3n g\u1ed1c.\n- V\u1edbi c\u00e2u h\u1ecfi ph\u00e1p l\u00fd c\u1ee5 th\u1ec3 ho\u1eb7c quy\u1ebft \u0111\u1ecbnh c\u00f3 r\u1ee7i ro t\u00e0i ch\u00ednh l\u1edbn, khuy\u00ean ng\u01b0\u1eddi d\u00f9ng tham v\u1ea5n chuy\u00ean gia QA/QC, \u0111\u01a1n v\u1ecb t\u01b0 v\u1ea5n xu\u1ea5t nh\u1eadp kh\u1ea9u ho\u1eb7c c\u01a1 quan qu\u1ea3n l\u00fd. B\u1ea1n kh\u00f4ng thay th\u1ebf t\u01b0 v\u1ea5n ph\u00e1p l\u00fd.\n- Ch\u1ec9 tr\u1ea3 l\u1eddi trong ph\u1ea1m vi xu\u1ea5t kh\u1ea9u th\u1ef1c ph\u1ea9m sang Hoa K\u1ef3/EU v\u00e0 d\u1ef1 \u00e1n PRECHECK. C\u00e2u h\u1ecfi ngo\u00e0i ph\u1ea1m vi th\u00ec l\u1ecbch s\u1ef1 t\u1eeb ch\u1ed1i v\u00e0 \u0111\u1ec1 ngh\u1ecb quay l\u1ea1i ch\u1ee7 \u0111\u1ec1 ch\u00ednh.\n- Kh\u00f4ng y\u00eau c\u1ea7u ng\u01b0\u1eddi d\u00f9ng cung c\u1ea5p th\u00f4ng tin b\u00ed m\u1eadt kinh doanh kh\u00f4ng c\u1ea7n thi\u1ebft (gi\u00e1 b\u00e1n, t\u00ean kh\u00e1ch h\u00e0ng, h\u1ee3p \u0111\u1ed3ng).\n\n### Quy tr\u00ecnh ch\u1ea5m \u0111i\u1ec3m (khi ng\u01b0\u1eddi d\u00f9ng mu\u1ed1n \u0111\u00e1nh gi\u00e1 m\u1ed9t s\u1ea3n ph\u1ea9m)\nH\u1ecfi l\u1ea7n l\u01b0\u1ee3t, m\u1ed7i l\u01b0\u1ee3t v\u00e0i c\u00e2u ng\u1eafn:\n1. S\u1ea3n ph\u1ea9m, th\u00e0nh ph\u1ea7n ch\u00ednh, m\u00e3 HS (n\u1ebfu c\u00f3), th\u1ecb tr\u01b0\u1eddng \u0111\u00edch (Hoa K\u1ef3, EU ho\u1eb7c c\u1ea3 hai).\n2. **Nh\u00f3m An to\u00e0n h\u00f3a h\u1ecdc/vi sinh:** \u0111\u00e3 ki\u1ec3m nghi\u1ec7m d\u01b0 l\u01b0\u1ee3ng thu\u1ed1c BVTV, \u0111\u1ed9c t\u1ed1 n\u1ea5m m\u1ed1c (v\u00ed d\u1ee5 aflatoxin), kim lo\u1ea1i n\u1eb7ng, vi sinh v\u1eadt g\u00e2y b\u1ec7nh (v\u00ed d\u1ee5 Salmonella) ch\u01b0a? C\u00f3 phi\u1ebfu k\u1ebft qu\u1ea3 (COA) t\u1eeb ph\u00f2ng th\u00ed nghi\u1ec7m \u0111\u1ee7 n\u0103ng l\u1ef1c kh\u00f4ng?\n3. **Nh\u00f3m Ghi nh\u00e3n/d\u1ecb \u1ee9ng:** nh\u00e3n \u0111\u00e3 \u0111\u00fang quy \u0111\u1ecbnh th\u1ecb tr\u01b0\u1eddng \u0111\u00edch ch\u01b0a? \u0110\u00e3 khai b\u00e1o ch\u1ea5t g\u00e2y d\u1ecb \u1ee9ng (v\u00ed d\u1ee5 h\u1ea1t c\u00e2y) v\u00e0 d\u00f9ng ng\u00f4n ng\u1eef ph\u00f9 h\u1ee3p ch\u01b0a?\n4. **Nh\u00f3m H\u1ed3 s\u01a1 v\u1eadn h\u00e0nh:** \u0111\u00e3 \u0111\u0103ng k\u00fd c\u01a1 s\u1edf, c\u00f3 HACCP ho\u1eb7c k\u1ebf ho\u1ea1ch an to\u00e0n th\u1ef1c ph\u1ea9m, c\u00f3 truy xu\u1ea5t ngu\u1ed3n g\u1ed1c, h\u1ed3 s\u01a1 nh\u00e0 cung c\u1ea5p, ch\u1ee9ng t\u1eeb l\u00f4 h\u00e0ng \u0111\u1ea7y \u0111\u1ee7 ch\u01b0a?\n\nSau \u0111\u00f3:\n- T\u00ednh ch\u1ec9 s\u1ed1, n\u00eau r\u00f5 t\u1eebng nh\u00f3m \u0111\u00f3ng g\u00f3p bao nhi\u00eau.\n- \u0110\u01b0a ra **top 3 h\u1ea1ng m\u1ee5c n\u00ean l\u00e0m tr\u01b0\u1edbc**.\n- K\u1ebft th\u00fac b\u1eb1ng l\u01b0u \u00fd: \u0111\u00e2y l\u00e0 c\u00f4ng c\u1ee5 \u01b0u ti\u00ean r\u00e0 so\u00e1t, kh\u00f4ng ph\u1ea3i d\u1ef1 b\u00e1o k\u1ebft qu\u1ea3 th\u1ef1c t\u1ebf.\n\n### \u0110\u1ecbnh d\u1ea1ng \u0111i\u1ec3m \u0111\u1ec1 xu\u1ea5t\n```\nCh\u1ec9 s\u1ed1 \u01b0u ti\u00ean r\u00e0 so\u00e1t: XX/100  (Th\u1ea5p / Trung b\u00ecnh / Cao)\n- An to\u00e0n h\u00f3a h\u1ecdc/vi sinh (w=3): ...\n- Ghi nh\u00e3n/d\u1ecb \u1ee9ng (w=2): ...\n- H\u1ed3 s\u01a1 v\u1eadn h\u00e0nh (w=1): ...\nVi\u1ec7c n\u00ean l\u00e0m tr\u01b0\u1edbc: 1) ... 2) ... 3) ...\nL\u01b0u \u00fd: ch\u1ec9 s\u1ed1 d\u00f9ng \u0111\u1ec3 s\u1eafp x\u1ebfp th\u1ee9 t\u1ef1 r\u00e0 so\u00e1t, kh\u00f4ng ph\u1ea3i x\u00e1c su\u1ea5t b\u1ecb t\u1eeb ch\u1ed1i.\n```\nPh\u00e2n m\u1ee9c g\u1ee3i \u00fd (\u0111\u1ec3 gi\u1ea3i th\u00edch cho d\u1ec5 hi\u1ec3u, kh\u00f4ng ph\u1ea3i ng\u01b0\u1ee1ng ch\u00ednh th\u1ee9c): 0\u201333 th\u1ea5p, 34\u201366 trung b\u00ecnh, 67\u2013100 cao.\n\n---\n";
const idx = build(KB);

const cors = (origin) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

async function askModel(env, question, chunks) {
  const context = chunks.map((c, i) => '[' + (i + 1) + '] ' + c.title + '\n' + c.text + '\nNguồn: ' + c.source).join('\n\n');
  const user = 'Ngữ cảnh tham khảo (chỉ dùng các đoạn này để trả lời; nếu không đủ thông tin, nói rõ và đề nghị chuyên gia xác nhận):\n\n' + context + '\n\nCâu hỏi: ' + question;
  // Gemini (gói miễn phí cho model Flash). Endpoint: generateContent, khóa gửi qua header x-goog-api-key.
  const model = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method: 'POST',
    headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
    }),
  });
  if (!r.ok) throw new Error('model_error ' + r.status);
  const data = await r.json();
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
  return parts.map(p => p.text || '').join('');
}

const env = process.env;

export default async function handler(request) {
  {
    const origin = env.ALLOW_ORIGIN || '*';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api/chat') return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: cors(origin) });
    let q = '';
    try { q = String((await request.json()).question || '').trim().slice(0, 1000); } catch (e) { return new Response(JSON.stringify({ error: 'bad_json' }), { status: 400, headers: cors(origin) }); }
    if (!q) return new Response(JSON.stringify({ error: 'empty_question' }), { status: 400, headers: cors(origin) });
    const hits = search(idx, q, 5);
    const sources = hits.map(h => ({ id: h.id, title: h.title, source: h.source }));
    if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ mode: 'retrieval_only', answer: 'Chưa cấu hình GEMINI_API_KEY. Các đoạn liên quan nhất:\n' + hits.map(h => '• ' + h.title).join('\n'), sources }), { headers: cors(origin) });
    try {
      const answer = await askModel(env, q, hits);
      return new Response(JSON.stringify({ mode: 'model', answer, sources }), { headers: cors(origin) });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'upstream_failed', detail: e.message }), { status: 502, headers: cors(origin) });
    }
  }
}
