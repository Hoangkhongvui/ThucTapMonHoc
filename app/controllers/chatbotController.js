const { GoogleGenerativeAI } = require('@google/generative-ai'); // <--- THƯ VIỆN KHÁC
const Product = require('../models/Product');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Dùng model này, thư viện cũ hỗ trợ alias rất tốt
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanJsonString(text) {
    if (!text) return null;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    return jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
}

const chatService = {
    analyzeUserQuery: async (userQuery) => {
        const prompt = `Bạn là một trợ lý tìm món ăn cho nhà hàng Hoàng Food. Khách hàng có thể hỏi bằng tiếng Việt, dùng các từ viết tắt (vd: "50k" = 50000), hoặc viết không rõ ràng.

        Khách hàng đang yêu cầu: "${userQuery}"

        Nhiệm vụ: Chỉ trích xuất các thông tin cần thiết để lọc món từ cơ sở dữ liệu.

        Yêu cầu cụ thể:
        - Trả về duy nhất một OBJECT JSON (KHÔNG có giải thích thêm, KHÔNG có markdown).
        - Trường "categories" là mảng các tên danh mục phù hợp với dữ liệu thực đơn (ví dụ: "Món mặn", "Món chay", "Nước uống", "Món lẩu", "Món ăn vặt", "Món tráng miệng"). Nếu không xác định, trả về mảng rỗng.
        - Trường "priceRange" là object {"min": số hoặc null, "max": số hoặc null} với giá tính bằng VND (ví dụ: 50000 cho 50k). Nếu khách nói "dưới 100k" -> max = 100000. Nếu không biết -> cả hai là null.
        - Trường "keywords" là mảng từ khóa ngắn (không dấu hoặc có dấu đều được) dùng để tìm trong title/desc (ví dụ: ["cay", "gà", "hải sản"]). Nếu không có -> trả về mảng rỗng.

        Một vài ví dụ đầu vào -> đầu ra mẫu (chỉ để tham khảo):
        Input: "Muốn ăn cay, khoảng 50k" -> {"categories": [], "priceRange": {"min": null, "max": 50000}, "keywords": ["cay"]}
        Input: "Tìm nước uống giá dưới 40k" -> {"categories": ["Nước uống"], "priceRange": {"min": null, "max": 40000}, "keywords": []}

        Hãy trả về JSON đúng định dạng như sau:
        { "categories": [], "priceRange": { "min": null, "max": null }, "keywords": [] }
        `;

        try {
            // Cú pháp gọi khác: model.generateContent()
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return JSON.parse(cleanJsonString(text));
        } catch (e) {
            console.error("Lỗi analyze:", e);
            return { categories: [], priceRange: { min: null, max: null }, keywords: [] };
        }
    },

    buildMongoQuery: (filter) => {
        // ... (Giữ nguyên code phần buildMongoQuery cũ) ...
        // Copy lại y nguyên hàm buildMongoQuery từ code trước
        const pipeline = [];
        pipeline.push({ $match: { status: 1 } });

        if (filter.categories && filter.categories.length > 0) {
            const catRegex = filter.categories.join('|');
            pipeline.push({ $match: { category: { $regex: catRegex, $options: 'i' } } });
        }

        const priceMatch = {};
        if (filter.priceRange.min) priceMatch.$gte = filter.priceRange.min;
        if (filter.priceRange.max) priceMatch.$lte = filter.priceRange.max;
        if (Object.keys(priceMatch).length > 0) pipeline.push({ $match: { price: priceMatch } });

        if (filter.keywords && filter.keywords.length > 0) {
            const keywordRegex = filter.keywords.join('|');
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: keywordRegex, $options: 'i' } },
                        { desc: { $regex: keywordRegex, $options: 'i' } }
                    ]
                }
            });
        }

        pipeline.push({ $limit: 8 });
        return pipeline;
    },

    getRecommendations: async (userQuery, products) => {
        // const menuShort = products.map(p => ({
        //     name: p.title,
        //     price: p.price,
        //     desc: p.desc
        // }));
        // const prompt = `... (Giữ nguyên prompt của bạn) ... Danh sách: ${JSON.stringify(menuShort)}`;


        // Rút gọn dữ liệu gửi lên AI
        const menuShort = products.map(p => ({
            name: p.title,
            price: p.price,
            desc: p.desc,
            category: p.category
        }));

        const prompt = `Bạn là nhân viên tư vấn món ăn cho nhà hàng Hoàng Food. Khách hàng có thể hỏi bằng tiếng Việt, dùng từ lóng hoặc đơn vị như "k","khoảng", "dưới".
            Khách hàng: "${userQuery}"

            Dưới đây là danh sách rút gọn các món hiện có (tên, giá, mô tả, danh mục):
            ${JSON.stringify(menuShort)}

            Nhiệm vụ (trả về chỉ 1 object JSON, KHÔNG giải thích):
            1) Viết nội dung "summary": một câu chào ngắn gọn + tóm tắt 1-2 dòng khuyến nghị tổng thể.
            2) Trong "recommendations" trả về tối đa 3 mục, mỗi mục có:
            - "productName": tên món chính xác phải khớp một trong tên trong danh sách trên (KHÔNG tạo tên mới).
            - "reason": 1 câu ngắn giải thích tại sao món này phù hợp với yêu cầu khách (ví dụ: 'vị cay đậm, nhiều ớt, phù hợp cho người thích cay').

            Nếu không tìm được món phù hợp, trả về { "summary": "..." , "recommendations": [] } với lời xin lỗi ngắn gọn trong summary.

            Example output format (strict JSON):
            {
            "summary": "...",
            "recommendations": [
                { "productName": "Cơm chiên cua", "reason": "Giá phù hợp, vị mặn ngọt phù hợp ăn chính" }
            ]
            }
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(cleanJsonString(response.text()));
        } catch (e) {
            console.error("Lỗi recommend:", e);
            return { summary: "Mời bạn xem menu ạ.", recommendations: [] };
        }
    },

    recommendProducts: async (userQuery) => {
        // ... (Giữ nguyên code phần main recommendProducts cũ) ...
         try {
            const filter = await chatService.analyzeUserQuery(userQuery);
            console.log("🔍 Filter:", JSON.stringify(filter));

            const pipeline = chatService.buildMongoQuery(filter);
            let products = await Product.aggregate(pipeline);

            if (products.length === 0) {
                products = await Product.aggregate([{ $match: { status: 1 } }, { $sample: { size: 5 } }]);
            }

            let advice = null;
            if (products.length > 0) {
                advice = await chatService.getRecommendations(userQuery, products);
            }

            return {
                products: products,
                advice: advice
            };

        } catch (error) {
            console.error("❌ Lỗi Chatbot:", error);
            return { error: true, message: "Hệ thống đang bận." };
        }
    }
};



module.exports = chatService;