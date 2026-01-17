window.onload = updateAmount();

async function checkSessionStatus() {
    try {
        const response = await fetch('/session/status');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error when check session:', error);
    }
}

async function detailProduct(id) {
    let modal = await document.querySelector('.modal.product-detail');
    event.preventDefault();
    var infoProduct = await getProductInfo(id);
    let modalHtml = `<div class="modal-header">
    <img class="product-image" src="${infoProduct.img}" alt="">
    </div>
    <div class="modal-body">
        <h2 class="product-title">${infoProduct.title}</h2>
        <div class="product-control">
            <div class="priceBox">
                <span class="current-price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
            </div>
        </div>
        <p class="product-description">${infoProduct.desc}</p>
    </div>
    <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product="${infoProduct.id}" onclick="buyNow('${infoProduct._id}')">Đặt hàng ngay</button>
            <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;
    document.querySelector('#product-detail-content').innerHTML = modalHtml;
    modal.classList.add('open');
    body.style.overflow = "hidden";
    //Cap nhat gia tien khi tang so luong san pham
    let tgbtn = document.querySelectorAll('.is-form');
    let qty = document.querySelector('.product-control .input-qty');
    let priceText = document.querySelector('.price');
    tgbtn.forEach(element => {
        element.addEventListener('click', () => {
            let price = infoProduct.price * parseInt(qty.value);
            priceText.innerHTML = vnd(price);
        });
    });
    // Them san pham vao gio hang
    let productbtn = document.querySelector('.button-dat');
    productbtn.addEventListener('click', (e) => {
        checkSessionStatus().then(sessionData => {
            if (sessionData.loggedIn) {
                addCart(sessionData.user.id, infoProduct.id);
            } else {
                toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
            }
        })
    })
    // Mua ngay san pham
    // dathangngay();
}

async function addCart(userId, productId) {
    const quantity = parseInt(document.querySelector('.input-qty').value);

    const popupDetailNote = document.querySelector('#popup-detail-note').value;
    const note = popupDetailNote === "" ? "Không có ghi chú" : popupDetailNote;

    if (isNaN(quantity) || quantity <= 0) {
        toast({ title: 'Lỗi', message: 'Vui lòng nhập số lượng hợp lệ.', type: 'error', duration: 3000 });
        return;
    }

    try {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                productId: productId,
                quantity: quantity,
                note: note
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            updateAmount();
            closeModal();
            toast({ title: 'Thành công', message: result.message, type: 'success', duration: 3000 });
        } else {
            toast({ title: 'Lỗi', message: result.message || 'Có lỗi xảy ra.', type: 'error', duration: 3000 });
        }

    } catch (error) {
        console.error('Lỗi khi gọi API thêm vào giỏ hàng:', error);
        toast({ title: 'Lỗi', message: 'Không thể kết nối đến máy chủ.', type: 'error', duration: 3000 });
    }
}

async function getProductInfo(id) {
  try {
    const response = await fetch(`/admin/product/${id}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    const infoProduct = await response.json();

    console.log('infoProduct:', infoProduct);
    return infoProduct;
  } catch (error) {
    console.error("Error fetching product:", error);
    alert("Unable to load product data.");
  }
}

// function dathangngay() {
//     let productInfo = document.getElementById("product-detail-content");
//     let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
//     datHangNgayBtn.onclick = () => {
//         if(localStorage.getItem('currentuser')) {
//             let productId = datHangNgayBtn.getAttribute("data-product");
//             let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
//             let notevalue = productInfo.querySelector("#popup-detail-note").value;
//             let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
//             let products = JSON.parse(localStorage.getItem('products'));
//             let a = products.find(item => item.id == productId);
//             a.soluong = parseInt(soluong);
//             a.note = ghichu;
//             checkoutpage.classList.add('active');
//             thanhtoanpage(2,a);
//             closeCart();
//             body.style.overflow = "hidden"
//         } else {
//             toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
//         }
//     }
// }

// Open & Close Cart
function openCart() {
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    body.style.overflow = "hidden";
}

function closeCart() {
    document.querySelector('.modal-cart').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}

// Lay so luong hang
async function getAmountCart() {
    try {
        const sessionData = await checkSessionStatus();

        if (sessionData && sessionData.loggedIn) {
            const userId = sessionData.user.id;

            const response = await fetch(`/cart/${userId}`);

            if (!response.ok) {
                console.error('Lỗi khi tải giỏ hàng, mã trạng thái:', response.status);
                return 0;
            }

            const result = await response.json();
            if (result.success) {
                return result.count;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Đã xảy ra lỗi trong getAmountCart:', error);
        return 0;
    }
}

//Update Amount Cart
async function updateAmount() {
    let amount = await getAmountCart();
    document.querySelector('.count-product-cart').innerText = amount;
}

// Save Cart Info
function saveAmountCart() {
    let inputQuantity = document.querySelectorAll(".cart-item-control .input-qty");
    let plusQuantity = document.querySelectorAll(".cart-item-control .is-form.plus");
    let minusQuantity = document.querySelectorAll(".cart-item-control .is-form.minus");
}

function animationCart() {
    document.querySelector(".count-product-cart").style.animation = "slidein ease 1s"
    setTimeout(()=>{
        document.querySelector(".count-product-cart").style.animation = "none"
    },1000)
}

function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (parseInt(qty.value) < qty.max) {
        qty.value = parseInt(qty.value) + 1;
    } else {
        qty.value = qty.max;
    }
}

function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}

async function showCart() {
    const sessionData = await checkSessionStatus();

    if (sessionData && sessionData.loggedIn) {
        const userId = sessionData.user.id;
        const response = await fetch(`/cart/${userId}`);
        const result = await response.json();

        if (result.success && result.cart.length > 0) {
            document.querySelector('.gio-hang-trong').style.display = 'none';
            document.querySelector('button.thanh-toan').classList.remove('disabled');

            let productCartHtml = '';

            const tongtien = result.cart.reduce((total, item) => {
                if (item.productId) {
                    return total + (item.quantity * item.productId.price);
                }
                return total;
            }, 0);

            updateCartTotal(tongtien);

            result.cart.forEach(item => {
                const product = item.productId;
                const quantity = item.quantity;
                const note = item.note || "Không có ghi chú";

                if (product) {
                    productCartHtml += `
                        <li class="cart-item" data-id="${product.id}">
                            <div class="cart-item-info">
                                <p class="cart-item-title">${product.title}</p>
                                <span class="cart-item-price price" data-price="${product.price}">
                                    ${vnd(parseInt(product.price))}
                                </span>
                            </div>
                            <p class="product-note"><i class="fa-light fa-pencil"></i><span>${note}</span></p>
                            <div class="cart-item-control">
                                <button class="cart-item-delete" onclick="deleteCartItem('${product.id}', this)">Xóa</button>
                                <div class="buttons_added">
                                    <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                                    <input class="input-qty" max="100" min="1" name="" type="number" value="${quantity}">
                                    <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                                </div>
                            </div>
                        </li>`;
                }
            });

            document.querySelector('.cart-list').innerHTML = productCartHtml;

        } else {
            document.querySelector('.gio-hang-trong').style.display = 'flex';
            document.querySelector('.cart-list').innerHTML = '';
            document.querySelector('button.thanh-toan').classList.add('disabled');

            updateCartTotal(0);
        }
    } else {
        updateCartTotal(0);
    }

    let modalCart = document.querySelector('.modal-cart');
    let containerCart = document.querySelector('.cart-container');
    let themmon = document.querySelector('.them-mon');
    modalCart.onclick = function () {
        closeCart();
    }
    themmon.onclick = function () {
        closeCart();
    }
    containerCart.addEventListener('click', (e) => {
        e.stopPropagation();
    })
}

function updateCartTotal(total) {
    const totalElement = document.querySelector('.text-price');
    if (totalElement) {
        totalElement.innerText = vnd(total);
    }
}

document.querySelector(".form-search-input").addEventListener("click",(e) => {
    e.preventDefault();
    document.getElementById("home-service").scrollIntoView();
})

document.querySelector(".filter-btn").addEventListener("click",(e) => {
    e.preventDefault();
    document.querySelector(".advanced-search").classList.toggle("open");
    document.getElementById("home-service").scrollIntoView();
})

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

var productAll = JSON.parse(localStorage.getItem('products')).filter(item => item.status == 1);
function searchProducts(mode) {
    let valeSearchInput = document.querySelector('.form-search-input').value;
    let valueCategory = document.getElementById("advanced-search-category-select").value;
    let minPrice = document.getElementById("min-price").value;
    let maxPrice = document.getElementById("max-price").value;
    if(parseInt(minPrice) > parseInt(maxPrice) && minPrice != "" && maxPrice != "") {
        alert("Giá đã nhập sai !");
    }

    let result = valueCategory == "Tất cả" ? productAll : productAll.filter((item) => {
        return item.category == valueCategory;
    });

    result = valeSearchInput == "" ? result : result.filter(item => {
        return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
    })

    if(minPrice == "" && maxPrice != "") {
        result = result.filter((item) => item.price <= maxPrice);
    } else if (minPrice != "" && maxPrice == "") {
        result = result.filter((item) => item.price >= minPrice);
    } else if(minPrice != "" && maxPrice != "") {
        result = result.filter((item) => item.price <= maxPrice && item.price >= minPrice);
    }

    document.getElementById("home-service").scrollIntoView();
    switch (mode){
        case 0:
            result = JSON.parse(localStorage.getItem('products'));;
            document.querySelector('.form-search-input').value = "";
            document.getElementById("advanced-search-category-select").value = "Tất cả";
            document.getElementById("min-price").value = "";
            document.getElementById("max-price").value = "";
            break;
        case 1:
            result.sort((a,b) => a.price - b.price)
            break;
        case 2:
            result.sort((a,b) => b.price - a.price)
            break;
    }
    showHomeProduct(result)
}

function showCategory(category) {
    document.getElementById('trangchu').classList.remove('hide');
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('order-history').classList.remove('open');
    let productSearch = productAll.filter(value => {
        return value.category.toString().toUpperCase().includes(category.toUpperCase());
    })
    let currentPageSeach = 1;
    displayList(productSearch, perPage, currentPageSeach);
    setupPagination(productSearch, perPage, currentPageSeach);
    document.getElementById("home-title").scrollIntoView();
}

async function buyNow(productId) {
    // const user = JSON.parse(localStorage.getItem("user"));
    // console.log("userrrr:", user);
    if (!user) {
        alert("Vui lòng đăng nhập");
        return;
    }

    const res = await fetch("/cart/buy-now", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: user.id,
            productId,
            quantity: 1
        })
    });

    const data = await res.json();

    if (data.success) {
        window.location.href = data.redirectUrl;
    } else {
        alert(data.message || "Có lỗi xảy ra");
    }
}

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.remove('open');
    document.getElementById('account-user').classList.add('open');
    userInfo();
}

function userInfo() {
    document.getElementById('infoname').value = user.fullname;
    document.getElementById('infophone').value = user.phone;
    document.getElementById('infoemail').value = user.email;
    document.getElementById('infoaddress').value = user.address;
    if (user.email == undefined) {
        infoemail.value = '';
    }
    if (user.address == undefined) {
        infoaddress.value = '';
    }
}

function changeInformation() {
    // gather DOM values
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    let user = JSON.parse(localStorage.getItem('currentuser')) || {};
    let infoname = document.getElementById('infoname');
    let infoemail = document.getElementById('infoemail');
    let infoaddress = document.getElementById('infoaddress');

    const payload = {
        fullname: infoname.value ? infoname.value.trim() : '',
        email: infoemail.value ? infoemail.value.trim() : '',
        address: infoaddress.value ? infoaddress.value.trim() : ''
    };

    // send to server
    fetch('/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.success) {
            // update localStorage copy (for existing client-side logic)
            user.fullname = data.user.fullname;
            user.email = data.user.email;
            user.address = data.user.address;

            // update accounts list if present
            let vitri = accounts.findIndex(item => item.phone == user.phone)
            if (vitri !== -1) {
                accounts[vitri].fullname = user.fullname;
                accounts[vitri].email = user.email;
                accounts[vitri].address = user.address;
                localStorage.setItem('accounts', JSON.stringify(accounts));
            }

            localStorage.setItem('currentuser', JSON.stringify(user));

            // update global window.user so templates and other scripts reflect new data
            try {
                window.user = data.user;
            } catch (e) {
                console.warn('Unable to set window.user:', e);
            }

            // refresh UI bindings
            if (typeof kiemtradangnhap === 'function') kiemtradangnhap();
            if (typeof userInfo === 'function') userInfo();
            toast({ title: 'Success', message: 'Cập nhật thông tin thành công !', type: 'success', duration: 3000 });
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            const msg = data && data.message ? data.message : 'Lỗi khi cập nhật thông tin';
            toast({ title: 'Error', message: msg, type: 'error', duration: 4000 });
        }
    })
    .catch(err => {
        console.error('Update info error:', err);
        toast({ title: 'Error', message: 'Không thể cập nhật thông tin', type: 'error', duration: 4000 });
    });
}

function changePassword() {
       // Gather DOM
    const passwordCurEl = document.getElementById('password-cur-info');
    const passwordAfterEl = document.getElementById('password-after-info');
    const passwordConfirmEl = document.getElementById('password-comfirm-info');

    const currentPassword = passwordCurEl ? passwordCurEl.value.trim() : '';
    const newPassword = passwordAfterEl ? passwordAfterEl.value.trim() : '';
    const confirmPassword = passwordConfirmEl ? passwordConfirmEl.value.trim() : '';

    // Clear previous errors
    document.querySelector('.password-cur-info-error').innerHTML = '';
    document.querySelector('.password-after-info-error').innerHTML = '';
    document.querySelector('.password-after-comfirm-error').innerHTML = '';

    // Basic validation
    if (!currentPassword) {
        document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
        return;
    }
    if (!newPassword) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        return;
    }
    if (newPassword.length < 6) {
        document.querySelector('.password-after-info-error').innerHTML = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        return;
    }
    if (!confirmPassword) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng xác nhận mật khẩu';
        return;
    }
    if (newPassword !== confirmPassword) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu xác nhận không khớp';
        return;
    }

    // Disable button to prevent double submit
    const btn = document.getElementById('save-password');
    if (btn) btn.disabled = true;

    fetch('/user/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    })
    .then(res => res.json())
    .then(data => {
        if (btn) btn.disabled = false;
        if (data && data.success) {
            // update localStorage copies if present
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentuser')) || null;
                if (currentUser) {
                    currentUser.password = newPassword;
                    localStorage.setItem('currentuser', JSON.stringify(currentUser));
                }
                const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
                if (currentUser && accounts.length) {
                    const idx = accounts.findIndex(a => a.phone === currentUser.phone);
                    if (idx !== -1) {
                        accounts[idx].password = newPassword;
                        localStorage.setItem('accounts', JSON.stringify(accounts));
                    }
                }
            } catch (e) {
                console.warn('Unable to update localStorage after password change', e);
            }

            toast({ title: 'Success', message: data.message || 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });
            // clear fields
            if (passwordCurEl) passwordCurEl.value = '';
            if (passwordAfterEl) passwordAfterEl.value = '';
            if (passwordConfirmEl) passwordConfirmEl.value = '';
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            const msg = data && data.message ? data.message : 'Lỗi khi đổi mật khẩu';
            toast({ title: 'Error', message: msg, type: 'error', duration: 4000 });
            // show server validation on field if applicable
            if (msg.toLowerCase().includes('current')) {
                document.querySelector('.password-cur-info-error').innerHTML = msg;
            }
        }
    })
    .catch(err => {
        if (btn) btn.disabled = false;
        console.error('Error updating password:', err);
        toast({ title: 'Error', message: 'Không thể kết nối tới máy chủ', type: 'error', duration: 4000 });
    });
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng
function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.add('open');
    renderOrderProduct();
}

function renderOrderProduct() {
    // Fetch orders from server for the logged-in user
    fetch('/orders/mine')
        .then(res => res.json())
        .then(data => {
            if (!data || !data.success) {
                document.querySelector('.order-history-section').innerHTML = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
                return;
            }

            const orders = data.orders || [];
            if (orders.length === 0) {
                document.querySelector('.order-history-section').innerHTML = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
                return;
            }

            let orderHtml = '';
            orders.forEach(item => {
                let productHtml = `<div class="order-history-group">`;

                // each item.products contains { productId: { title, price, img }, quantity, price, note }
                item.products.forEach(p => {
                    const prod = p.productId || {};
                    const qty = p.quantity || p.soluong || 1;
                    const note = p.note || '';
                    const price = p.price || prod.price || 0;

                    productHtml += `<div class="order-history">
                        <div class="order-history-left">
                            <img src="${prod.img || ''}" alt="">
                            <div class="order-history-info">
                                <h4>${prod.title || 'Sản phẩm'}</h4>
                                <p class="order-history-note"><i class="fa-light fa-pen"></i> ${note}</p>
                                <p class="order-history-quantity">x${qty}</p>
                            </div>
                        </div>
                        <div class="order-history-right">
                            <div class="order-history-price">
                                <span class="order-history-current-price">${vnd(price)}</span>
                            </div>
                        </div>
                    </div>`;
                });

                let textCompl = item.trangthai == 1 ? 'Đã xử lý' : 'Đang xử lý';
                let classCompl = item.trangthai == 1 ? 'complete' : 'no-complete';

                productHtml += `<div class="order-history-control">
                    <div class="order-history-status">
                        <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                        <button id="order-history-detail" onclick="detailOrder('${item._id || item.id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                    </div>
                    <div class="order-history-total">
                        <span class="order-history-total-desc">Tổng tiền: </span>
                        <span class="order-history-toltal-price">${vnd(item.tongtien || item.total || 0)}</span>
                    </div>
                </div>`;

                productHtml += `</div>`;
                orderHtml += productHtml;
            });

            document.querySelector('.order-history-section').innerHTML = orderHtml;
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            document.querySelector('.order-history-section').innerHTML = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Không thể tải đơn hàng</p></div>`;
        });
}

// Xem chi tiet don hang
async function detailOrder(id) {
    try {
        // Fetch current user's orders (reuse same endpoint as renderOrderProduct)
        const res = await fetch('/orders/mine');
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        if (!data || !data.success) throw new Error('No orders returned');

        const orders = data.orders || [];
        const detail = orders.find(item => (item._id == id || item.id == id));
        if (!detail) {
            toast({ title: 'Error', message: 'Không tìm thấy đơn hàng', type: 'error', duration: 3000 });
            return;
        }

        // Helper to read multiple possible field names
        const pick = (obj, ...keys) => {
            for (const k of keys) if (obj && obj[k] !== undefined) return obj[k];
            return '';
        };

        const orderDate = pick(detail, 'thoigiandat', 'createdAt', 'ngaydathang');
        const shipMethod = pick(detail, 'hinhthucgiao', 'hinhthuc', 'phuongthuc');
        const shipTimeLabel = pick(detail, 'thoigiangiao', 'giohangiao', 'deliveryTime');
        const shipDate = pick(detail, 'ngaygiaohang', 'ngaynhanhang', 'deliveryDate');
        const address = pick(detail, 'diachinhan', 'diachi', 'address');
        const receiver = pick(detail, 'tenguoinhan', 'nguoinhan', 'receiver');
        const phone = pick(detail, 'sdtnhan', 'sdt', 'phone');

        let detailOrderHtml = `
            <ul class="detail-order-group">
                <li class="detail-order-item">
                    <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                    <span class="detail-order-item-right">${orderDate ? formatDate(orderDate) : ''}</span>
                </li>
                <li class="detail-order-item">
                    <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                    <span class="detail-order-item-right">${shipMethod}</span>
                </li>
                <li class="detail-order-item">
                    <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
                    <span class="detail-order-item-right">${(shipTimeLabel == '' ? '' : (shipTimeLabel + ' - ')) + (shipDate ? formatDate(shipDate) : '')}</span>
                </li>
                <li class="detail-order-item">
                    <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
                    <span class="detail-order-item-right">${address}</span>
                </li>
                <li class="detail-order-item">
                    <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                    <span class="detail-order-item-right">${receiver}</span>
                </li>
                <li class="detail-order-item">
                    <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
                    <span class="detail-order-item-right">${phone}</span>
                </li>
            </ul>`;

        document.querySelector('.modal.detail-order').classList.add('open');
        document.querySelector('.detail-order-content').innerHTML = detailOrderHtml;

    } catch (err) {
        console.error('Error loading order detail:', err);
        toast({ title: 'Error', message: 'Không thể tải chi tiết đơn hàng', type: 'error', duration: 3000 });
    }
}
