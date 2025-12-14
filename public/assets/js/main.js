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
            <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
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
    dathangngay();
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

function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        if(localStorage.getItem('currentuser')) {
            let productId = datHangNgayBtn.getAttribute("data-product");
            let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
            let notevalue = productInfo.querySelector("#popup-detail-note").value;
            let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
            let products = JSON.parse(localStorage.getItem('products'));
            let a = products.find(item => item.id == productId);
            a.soluong = parseInt(soluong);
            a.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2,a);
            closeCart();
            body.style.overflow = "hidden"
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    }
}

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