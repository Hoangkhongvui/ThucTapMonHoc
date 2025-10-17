async function detailOrder(id) {
    let order = await fetch(`/order/${id}`)
    .then(res => res.json())
    .then(data => data.order)
    .catch(err => {
        console.error('Lỗi khi lấy đơn hàng:', err);
        return null;
    });
    let ctDon = order.products;

    if (!order) {
        console.error("Không tìm thấy đơn hàng");
        return;
    }

    document.querySelector(".modal.detail-order").classList.add("open");
    let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;

    ctDon.forEach((item) => {
        console.log(item)
        spHtml += `<div class="order-product">
            <div class="order-product-left">
                <img src="${item.productId.img}" alt="">
                <div class="order-product-info">
                    <h4>${item.title}</h4>
                    <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note}</p>
                    <p class="order-product-quantity">SL: ${item.quantity}<p>
                </div>
            </div>
            <div class="order-product-right">
                <div class="order-product-price">
                    <span class="order-product-current-price">${vnd(item.price)}</span>
                </div>
            </div>
        </div>`;
    });
    spHtml += `</div></div>`;
    spHtml += `<div class="modal-detail-right">
        <ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(order.thoigiandat)}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${order.hinhthucgiao}</span>
            </li>
            <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${order.tenguoinhan}</span>
            </li>
            <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
            <span class="detail-order-item-right">${order.sdtnhan}</span>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                <p class="detail-order-item-b">${(order.thoigiangiao == "" ? "" : (order.thoigiangiao + " - ")) + formatDate(order.ngaygiaohang)}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                <p class="detail-order-item-b">${order.diachinhan}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                <p class="detail-order-item-b">${order.ghichu}</p>
            </li>
        </ul>
    </div>`;
    document.querySelector(".modal-detail-order").innerHTML = spHtml;

    let classDetailBtn = order.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
    let textDetailBtn = order.trangthai == 0 ? "Chưa xử lý" : "Đã xử lý";
    document.querySelector(
        ".modal-detail-bottom"
    ).innerHTML = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.tongtien)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${classDetailBtn}" onclick="updateStatus('${order._id}')">${textDetailBtn}</button>
    </div>`;
}

async function updateStatus(id) {
    try {
        const confirmUpdate = confirm("Bạn có chắc muốn cập nhật trạng thái đơn hàng này?");
        if (!confirmUpdate) return;

        // Gửi request PATCH tới API
        const response = await fetch(`/order/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Ví dụ: cập nhật sang trạng thái "1" (Hoàn thành)
                // Có thể thay bằng giá trị động nếu có input chọn trạng thái
                trangthai: 1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Lỗi cập nhật trạng thái:", data.message);
            alert("Cập nhật thất bại: " + data.message);
            return;
        }

        alert("Cập nhật trạng thái đơn hàng thành công!");
        // Tải lại trang hoặc cập nhật lại giao diện nếu cần
        window.location.reload();

    } catch (err) {
        console.error("Lỗi khi gọi API cập nhật:", err);
        alert("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng.");
    }
}
