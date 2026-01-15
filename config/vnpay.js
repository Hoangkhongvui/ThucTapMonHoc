const vnPayConfig = {
    // vnp_TmnCode: "7YYDM08S",
    // vnp_HashSecret: "JIES5TXJ3G18L0GFL4UT2R621CVJXHTL",
    // vnp_TmnCode: "DHXAN1QZ",
    // vnp_HashSecret: "GEDS50ZU507WNC9MCH7HF8OSID46ABM7",

    vnp_TmnCode: "NJJ0R8FS",
    vnp_HashSecret: "BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW",

    // "TmnCode": "NJJ0R8FS", //NJJ0R8FS //9HZKBNNN
    // "HashSecret": "BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW", //BYKJBHPPZKQMKBIBGGXIYKWYFAYSJXCW //8HGHV2MT8QI5NLICKG28HOBLJ0AATIE6
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_ReturnUrl: "http://localhost:3000/order-success"
}

module.exports = vnPayConfig;
