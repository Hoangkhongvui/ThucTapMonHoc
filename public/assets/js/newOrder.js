window.onload = setDateOrder();

function setDateOrder() {
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
        </a>
        <a href="javascript:;" class="pick-date" data-date="${ngaymai}">
            <span class="text">Ngày mai</span>
            <span class="date">${ngaymai.getDate()}/${ngaymai.getMonth() + 1}</span>
        </a>

        <a href="javascript:;" class="pick-date" data-date="${ngaykia}">
            <span class="text">Ngày kia</span>
            <span class="date">${ngaykia.getDate()}/${ngaykia.getMonth() + 1}</span>
    </a>`
    document.querySelector('.date-order').innerHTML = dateorderhtml;
    let pickdate = document.getElementsByClassName('pick-date')
    for(let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
        }
    }

    // Xu ly hinh thuc giao hang
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");
    // let priceFinal = document.querySelectorAll('.');

    tudenlay.addEventListener('click', () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal());
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price));
                break;
        }
    })

    giaotannoi.addEventListener('click', () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
                break;
        }
    })
}

const orderBtn = document.querySelector(".complete-checkout-btn");
orderBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    const sessionData = await checkSessionStatus();
    if (!sessionData || !sessionData.loggedIn) {
        toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        return;
    }
    const userId = sessionData.user.id;

    const tenguoinhan = document.getElementById("tennguoinhan").value.trim();
    const sdtnhan = document.getElementById("sdtnhan").value.trim();
    const diachinhan = document.getElementById("diachinhan").value.trim();
    const ghichu = document.querySelector(".note-order").value.trim();

    if (!tenguoinhan || !sdtnhan) {
        toast({ title: 'Warning', message: 'Vui lòng nhập đầy đủ thông tin người nhận !', type: 'warning', duration: 3000 });
        return;
    }

    const isGiaoTanNoi = document.getElementById("giaotannoi").classList.contains("active");
    const hinhthucgiao = isGiaoTanNoi ? "Giao tận nơi" : "Nhận tại cửa hàng";

    let thoigiangiao = "Giao ngay khi xong";
    if (document.getElementById("deliverytime").checked) {
        const selectTime = document.querySelector(".choise-time");
        thoigiangiao = `Giao vào giờ ${selectTime.value}`;
    }

    let ngaygiaohang = new Date();
    const dateInput = document.querySelector(".date-order input");
    if (dateInput && dateInput.value) {
        ngaygiaohang = new Date(dateInput.value);
    }

    const productElements = document.querySelectorAll(".food-total");
    const products = [];

    productElements.forEach(el => {
        const productId = el.getAttribute("data-product-id");
        const quantityText = el.querySelector(".count")?.textContent || "0";
        const title = el.querySelector(".name-food")?.textContent.trim() || "";
        const quantity = parseInt(quantityText.replace("x", "").trim(), 10) || 1;

        const priceText = el.getAttribute("data-product-price") || "0";
        const price = Number(priceText);

        products.push({
            productId,
            title,
            quantity,
            price,
            note: ""
        });
    });

    if (products.length === 0) {
        alert("Không có sản phẩm trong đơn hàng!");
        return;
    }

    let tongtien = 0;
    products.forEach(p => tongtien += p.price * p.quantity);

    const shippingFee = 30000;
    tongtien += shippingFee;

    const orderData = {
        userId,
        tenguoinhan,
        sdtnhan,
        diachinhan,
        ghichu,
        hinhthucgiao,
        thoigiangiao,
        ngaygiaohang,
        products,
        tongtien
    };

    console.log("Order gửi lên:", orderData);

    try {
        const response = await fetch("/order/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
             toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 1000 });
            setTimeout((e)=>{
                window.location = "/";
            },2000);
        } else {
            alert("Lỗi đặt hàng: " + (result.message || "Không xác định"));
        }
    } catch (error) {
        console.error("Error khi tạo order:", error);
        alert("Không thể đặt hàng. Vui lòng thử lại sau.");
    }
});
