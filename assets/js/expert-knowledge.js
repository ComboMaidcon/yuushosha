// Tóm tắt từ nguồn cơ quan công bố, đối chiếu ngày 22/11/2026.
export const checkedOn = '22/11/2026';

const sources = {
    imports: ['FDA · Importing Human Foods', 'https://www.fda.gov/industry/importing-fda-regulated-products/importing-human-foods'],
    registration: ['FDA · Đăng ký và U.S. Agent', 'https://www.fda.gov/food/inspections-protect-food-supply/foreign-food-facility-inspection-program-questions-answers'],
    renewal: ['FDA · Gia hạn đăng ký cơ sở', 'https://www.fda.gov/food/hfp-constituent-updates/fda-reminds-food-facilities-biennial-renewal-requirements'],
    fsvp: ['FDA · FSVP', 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals'],
    exemption: ['eCFR · 21 CFR 1.501', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-1/subpart-L/section-1.501'],
    seafood: ['FDA · Seafood HACCP và FSMA', 'https://www.fda.gov/media/106733/download'],
    prior: ['FDA · Prior Notice', 'https://www.fda.gov/industry/fda-import-process/prior-notice-imported-foods'],
    labels: ['FDA · Food Labeling Guide', 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-food-labeling-guide'],
    allergy: ['FDA · Chất gây dị ứng thực phẩm', 'https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies'],
    canned: ['FDA · Thực phẩm axit hóa và đồ hộp axit thấp', 'https://www.fda.gov/food/guidance-documents-regulatory-information-topic-food-and-dietary-supplements/acidified-low-acid-canned-foods-guidance-documents-regulatory-information'],
    alert: ['FDA · Import Alerts', 'https://www.fda.gov/industry/actions-enforcement/import-alerts'],
    refusals: ['FDA · Import Refusals', 'https://www.fda.gov/industry/fda-import-process/import-refusals'],
    isf: ['CBP · Importer Security Filing', 'https://www.help.cbp.gov/s/article/Article-1868?language=en_US'],
    hts: ['USITC · Harmonized Tariff Schedule', 'https://hts.usitc.gov/'],
    eu: ['Ủy ban Châu Âu · RASFF', 'https://food.ec.europa.eu/food-safety/rasff_en']
};

const topics = [
    {
        id: 'start', keywords: ['lo dau tien', 'bat dau tu dau', 'can chuan bi', 'quy trinh xuat', 'checklist xuat', 'nhap khau thuc pham'],
        title: 'Checklist cho lô thực phẩm đầu tiên',
        text: '1. Xác định loại thực phẩm, thành phần, cách chế biến, đóng gói và bảo quản.\n2. Làm rõ phạm vi FDA, cơ sở phải đăng ký và yêu cầu riêng theo nhóm hàng.\n3. Chốt với nhà nhập khẩu Hoa Kỳ ai thực hiện FSVP hoặc chương trình tương ứng.\n4. Rà nhãn, hồ sơ chất lượng và điều kiện nhập. Thống nhất với broker việc khai Prior Notice và thủ tục CBP áp dụng.',
        next: 'Bạn xuất mặt hàng nào, ở dạng gì và đi đường biển, hàng không hay bưu chính?',
        sources: ['imports', 'fsvp', 'prior']
    },
    {
        id: 'facility', keywords: ['dang ky fda', 'dang ky co so', 'gia han fda', 'gia han dang ky', 'us agent', 'u s agent', 'ffr', 'ufi', 'chung nhan fda', 'fda approved', 'product listing'],
        title: 'Đăng ký cơ sở thực phẩm và U.S. Agent',
        text: 'Cơ sở sản xuất, chế biến, đóng gói hoặc lưu giữ thực phẩm cho thị trường Hoa Kỳ thường phải đăng ký FDA, trừ trường hợp được miễn. Cơ sở nước ngoài thuộc diện đăng ký phải chỉ định U.S. Agent làm đầu mối liên lạc với FDA. FDA yêu cầu gia hạn đăng ký trong kỳ 01/10–31/12 của năm chẵn. Đăng ký cơ sở không xác nhận sản phẩm đã được FDA phê duyệt. Thực phẩm thông thường không cần một chứng nhận FDA duy nhất cho từng sản phẩm. Một số nhóm như đồ hộp axit thấp hoặc thực phẩm axit hóa có thủ tục riêng.',
        next: 'Xác nhận cơ sở nào thực hiện chế biến, đóng gói và lưu giữ. Cơ sở nào đã có hồ sơ FFR?',
        sources: ['registration', 'renewal', 'imports']
    },
    {
        id: 'fsvp', keywords: ['fsvp', 'fsvp importer', 'foreign supplier verification', 'xac minh nha cung cap', 'nha nhap khau chiu', 'importer of record'],
        title: 'FSVP và trách nhiệm của nhà nhập khẩu Hoa Kỳ',
        text: 'Khi FSVP áp dụng, nghĩa vụ xác minh nhà cung cấp thuộc FSVP importer. Đây thường là chủ sở hữu hoặc người nhận hàng tại Hoa Kỳ vào thời điểm nhập. Nếu không có chủ sở hữu hay người nhận tại Hoa Kỳ, cần người đại diện tại Hoa Kỳ có văn bản đồng ý theo quy định. U.S. Agent của cơ sở thực phẩm, FSVP importer và Importer of Record là các vai trò cần phân biệt. Cá và sản phẩm thủy sản từ nhà cung cấp thuộc diện và tuân thủ Seafood HACCP theo Phần 123 thuộc ngoại lệ FSVP tương ứng.',
        next: 'Chốt vai trò với nhà nhập khẩu và broker trước khi gửi lô. Bạn đang chuẩn bị nhóm thực phẩm nào?',
        sources: ['fsvp', 'exemption']
    },
    {
        id: 'seafood', keywords: ['tom dong lanh', 'ca dong lanh', 'hai san', 'thuy san', 'seafood', 'haccp tom', 'seafood haccp', 'shrimp', 'tom'],
        title: 'Tôm và thủy sản Việt Nam sang Hoa Kỳ',
        text: 'Rà phạm vi Seafood HACCP (21 CFR Part 123) theo dạng sản phẩm và cơ sở chế biến. Đối với cá và sản phẩm thủy sản từ nhà cung cấp nước ngoài thuộc diện và tuân thủ quy định này, ngoại lệ FSVP áp dụng theo 21 CFR 1.501(b). Nhà nhập khẩu vẫn có nghĩa vụ xác minh theo 21 CFR 123.12. Chuẩn bị mô tả sản phẩm, hồ sơ HACCP liên quan, COA đúng lô nếu cần và nhãn. Tra Import Alerts theo tên cơ sở và sản phẩm trước khi gửi lô.',
        next: 'Tôm sống hay đã nấu chín? Dạng bán lẻ hay nguyên liệu, đông lạnh hay bảo quản thường?',
        sources: ['seafood', 'exemption', 'alert']
    },
    {
        id: 'prior', keywords: ['prior notice', 'thong bao truoc', 'pnsi', 'buuchinh', 'buu chinh'],
        title: 'Khai báo Prior Notice cho thực phẩm nhập khẩu',
        text: 'Prior Notice là thông tin về lô thực phẩm gửi FDA trước khi đến Hoa Kỳ, xét theo trường hợp áp dụng. Người thực hiện cần biết cơ sở sản xuất, sản phẩm, tuyến vận chuyển và thời điểm đến. FDA hướng dẫn nộp qua PNSI hoặc hệ thống khai điện tử của CBP. Mốc nộp và dữ liệu phụ thuộc phương thức vận chuyển.',
        next: 'Lô của bạn đi biển, hàng không, đường bộ hay bưu chính? Ai sẽ đứng tên khai?',
        sources: ['prior']
    },
    {
        id: 'label', keywords: ['nhan', 'label', 'nutrition facts', 'khau phan', 'khoi luong tinh', 'thanh phan tren nhan', 'tieng anh', 'claim'],
        title: 'Rà nhãn thực phẩm bán tại Hoa Kỳ',
        text: 'Kiểm tra tên thực phẩm, lượng tịnh, danh sách thành phần, thông tin doanh nghiệp, chất gây dị ứng và Nutrition Facts theo phạm vi áp dụng. Đối chiếu yêu cầu ngôn ngữ và nội dung quảng cáo trên nhãn. Nếu dự kiến miễn ghi thông tin dinh dưỡng, cần kiểm tra điều kiện của trường hợp cụ thể.',
        next: 'Bạn đóng gói bán lẻ hay giao nguyên liệu số lượng lớn? Cho biết thành phần và tuyên bố dự kiến trên nhãn.',
        sources: ['labels', 'allergy']
    },
    {
        id: 'allergen', keywords: ['di ung', 'allergen', 'hat dieu', 'cashew', 'contains', 'hat cay', 'me rang'],
        title: 'Hạt điều và khai báo chất gây dị ứng',
        text: 'Hạt điều thuộc nhóm hạt cây. Khi quy định ghi nhãn chất gây dị ứng của FDA áp dụng, xác định rõ loại hạt (cashew) trên nhãn, đồng thời đối chiếu các chất gây dị ứng từ thành phần khác hoặc gia vị. Nếu dùng dòng Contains, dòng này phải bao quát tất cả chất gây dị ứng chính có trong thành phần. Đánh giá nguy cơ tiếp xúc chéo theo dây chuyền thực tế.',
        next: 'Hạt điều rang muối, tẩm gia vị hay nguyên liệu? Dây chuyền có dùng sữa, mè, đậu phộng hoặc hạt cây khác không?',
        sources: ['allergy', 'labels']
    },
    {
        id: 'canned', keywords: ['do hop', 'axit thap', 'axit hoa', 'lacf', 'fce', 'sid', 'dong kin', 'tiet trung'],
        title: 'Đồ hộp axit thấp và thực phẩm axit hóa',
        text: 'Đối với thực phẩm bảo quản ở nhiệt độ thường, đóng kín thuộc nhóm axit hóa hoặc đồ hộp axit thấp, FDA yêu cầu đăng ký cơ sở chế biến và khai quy trình sản xuất áp dụng cho từng tổ hợp sản phẩm, cách chế biến và quy cách bao bì theo 21 CFR Part 108. Việc phân loại và lập quy trình cần dựa trên hồ sơ kỹ thuật của sản phẩm.',
        next: 'Sản phẩm bảo quản lạnh hay nhiệt độ thường? Hãy xác nhận quy cách bao bì và phân loại với đơn vị chuyên môn.',
        sources: ['canned']
    },
    {
        id: 'alerts', keywords: ['import alert', 'import refusal', 'dwpe', 'red list', 'giu hang', 'tu choi', 'refusal', 'canh bao fda'],
        title: 'Phân biệt cảnh báo, giữ hàng và từ chối nhập khẩu',
        text: 'Import Alert hỗ trợ FDA nhận diện các trường hợp có thể giữ hàng không cần kiểm tra thực tế (DWPE). Phạm vi phụ thuộc cảnh báo và cơ sở, sản phẩm liên quan. Import Refusal ghi nhận quyết định từ chối đã xảy ra. Một mã lịch sử của nhóm hàng không cho biết lô hàng mới hoặc doanh nghiệp cụ thể đang bị giữ.',
        next: 'Nếu đang có thông báo lô hàng, hãy xem loại thông báo, mã lý do, cơ sở, sản phẩm và hạn phản hồi. Phối hợp với nhà nhập khẩu.',
        sources: ['alert', 'refusals']
    },
    {
        id: 'customs', keywords: ['isf', '10 2', 'khai hai quan', 'customs', 'cbp', 'ma hs', 'ma hts', 'hts', 'thuong ma hoa ky', 'thue nhap khau', 'ace', 'duong bien'],
        title: 'Thủ tục CBP, ISF và mã phân loại Hoa Kỳ',
        text: 'ISF (10+2) là khai báo an ninh hàng hóa trước khi nhập bằng tàu biển trong phạm vi áp dụng. Prior Notice là nghĩa vụ khai báo riêng của FDA đối với thực phẩm. Dùng HTS Hoa Kỳ để kiểm tra phân loại và làm việc với broker về mã khai nhập, dữ liệu ISF, cảng đến và thời hạn. Thuế thực tế phụ thuộc phân loại, xuất xứ và biện pháp áp dụng ở thời điểm nhập.',
        next: 'Bạn biết dạng chế biến, thành phần chính và phương thức vận chuyển chưa?',
        sources: ['isf', 'hts', 'prior']
    },
    {
        id: 'scope', keywords: ['rasff', 'chau au', 'eu', 'mocra', 'my pham', 'thiet bi y te', 'usda', 'fsis', 'thuc pham bo sung', 'thit ga'],
        title: 'Phạm vi của PRECHECK',
        text: 'Bản sàng lọc hiện tập trung vào thực phẩm Việt Nam vào Hoa Kỳ trong phạm vi FDA. Với hàng thuộc cơ quan hoặc chế độ riêng như USDA-FSIS, mỹ phẩm hay thực phẩm bổ sung, cần xác định đúng phân loại và kiểm tra nguồn áp dụng. RASFF là nguồn tham khảo cho EU.',
        next: 'Bạn có thể mô tả sản phẩm, thành phần và thị trường đích để xác định bước tra cứu phù hợp.',
        sources: ['imports', 'eu']
    },
    {
        id: 'score', keywords: ['diem', 'diem rui ro', 'xac suat', 'risk score', 'chi so', 'cao co phai', 'bao cao dung nguon', 'cap nhat du lieu', 'coa', 'ket qua kiem nghiem', 'kiem chung'],
        title: 'Đọc báo cáo sàng lọc PRECHECK',
        text: 'Mở phần Cách tính chỉ số trong báo cáo để xem điểm tín hiệu lịch sử và điểm hồ sơ thiếu. Tần suất dùng các dòng đã bị từ chối trong tập dữ liệu, nên không đo xác suất lô mới bị từ chối. Bản này nhận diện tài liệu qua tên tệp và không xác minh nội dung COA. Chỉ số giúp ưu tiên rà soát trước khi đối chiếu quy định, chứng từ và kết quả kiểm nghiệm thực tế.',
        next: 'Bạn đang cần hiểu chỉ số, tìm nguồn hay kiểm tra mục hành động?',
        sources: ['refusals']
    }
];

const normalize = value => String(value).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase()
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();

function rank(question) {
    const text = ' ' + normalize(question) + ' ';
    return topics.map(topic => {
        const hits = topic.keywords.filter(term => text.includes(' ' + term + ' '));
        return { topic, score: hits.reduce((sum, term) => sum + (term.includes(' ') ? 3 : 1), 0) };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
}

export function matchTopics(question, history = []) {
    const direct = rank(question);
    const recent = history.at(-1);
    const followUp = recent && /^(vay |neu |con |thi |lo |san pham nay|truong hop nay|nhu vay|minh |toi |bao lau)/.test(normalize(question));
    const contextual = followUp ? rank(recent) : [];
    const ordered = [...direct, ...contextual];
    return [...new Set(ordered.map(item => item.topic))].slice(0, 3);
}

export function getSources(ids) {
    return [...new Set(ids)].filter(id => Object.hasOwn(sources, id)).map(id => {
        const [title, url] = sources[id];
        return { id, title, source: title, url };
    });
}

export function localAnswer(question, hits = matchTopics(question)) {
    if (!hits.length) {
        return {
            answer: 'Bạn đang xuất sản phẩm gì sang Hoa Kỳ, ở dạng chế biến và đóng gói nào? Tôi có thể giúp xác định bước cần tra về đăng ký cơ sở, FSVP, ghi nhãn, Prior Notice hoặc Seafood HACCP.',
            sources: getSources(['imports'])
        };
    }
    const multiTopic = /\b(khac|phan biet|so sanh| va |deu)\b/.test(normalize(question));
    const relevant = hits.slice(0, multiTopic ? 2 : 1);
    return {
        answer: relevant.map(topic => topic.title + '\n' + topic.text).join('\n\n') + '\n\n' + relevant[0].next,
        sources: getSources(relevant.flatMap(topic => topic.sources))
    };
}
