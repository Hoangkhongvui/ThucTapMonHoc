function createObj(){
    const result = soldProducts.map(item => ({
        id: item._id,
        title: item.title,
        img: item.image,
        price: item.price,
        category: item.category,
        quantity: item.totalSold,
        totalMoney: item.totalMoney,
    }));
    return result;
}

function thongKe(mode) {
    let categoryTk = document.getElementById("the-loai-tk").value;
    let ct = document.getElementById("form-search-tk").value;
    let arrDetail = createObj();
    let result = categoryTk == "Tất cả" ? arrDetail : arrDetail.filter((item) => {
        return item.category == categoryTk;
    });

    result = ct == "" ? result : result.filter((item) => {
        return (item.title.toLowerCase().includes(ct.toLowerCase()));
    });

    showThongKe(result,mode);
}

function showOverview(arr){
    document.getElementById("quantity-product").innerText = arr.length;
    document.getElementById("quantity-order").innerText = arr.reduce((sum, cur) => (sum + parseInt(cur.quantity)),0);
    document.getElementById("quantity-sale").innerText = vnd(arr.reduce((sum, cur) => (sum + parseInt(cur.doanhthu)),0));
}

function showThongKe(arr,mode) {
    let orderHtml = "";
    let mergeObj = mergeObjThongKe(arr);
    showOverview(mergeObj);

    switch (mode){
        case 0:
            mergeObj = mergeObjThongKe(createObj());
            showOverview(mergeObj);
            document.getElementById("the-loai-tk").value = "Tất cả";
            document.getElementById("form-search-tk").value = "";
            break;
        case 1:
            mergeObj.sort((a,b) => parseInt(a.quantity) - parseInt(b.quantity))
            break;
        case 2:
            mergeObj.sort((a,b) => parseInt(b.quantity) - parseInt(a.quantity))
            break;
    }
    for(let i = 0; i < mergeObj.length; i++) {
        orderHtml += `
            <tr>
            <td>${i + 1}</td>
            <td><div class="prod-img-title"><img class="prd-img-tbl" src="${mergeObj[i].img}" alt=""><p>${mergeObj[i].title}</p></div></td>
            <td>${mergeObj[i].quantity}</td>
            <td>${vnd(mergeObj[i].doanhthu)}</td>
            <td><button class="btn-detail product-order-detail" data-id="${mergeObj[i].id}"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
            </tr>
        `;
    }
    document.getElementById("showTk").innerHTML = orderHtml;
    document.querySelectorAll(".product-order-detail").forEach(item => {
        let idProduct = item.getAttribute("data-id");
        item.addEventListener("click", () => {
            detailOrderProduct(idProduct);
        })
    })
}

document.querySelectorAll(".product-order-detail").forEach(item => {
    let idProduct = item.getAttribute("data-id");
    item.addEventListener("click", () => {
        detailOrderProduct(idProduct);
    })
})

function mergeObjThongKe(arr) {
    let result = [];
    arr.forEach(item => {
        let check = result.find(i => i.id == item.id)

        if(check){
            check.quantity = parseInt(check.quantity)  + parseInt(item.quantity);
            check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
        } else {
            const newItem = {...item}
            newItem.doanhthu = newItem.price * newItem.quantity;
            result.push(newItem);
        }

    });
    return result;
}

async function loadOrdersByProduct(productId) {
    try {
        const res = await fetch(`/statistic/product/${productId}`);
        const data = await res.json();

        if (!data.success) {
            console.error("API error:", data.message);
            return;
        }

        console.log("Orders by product:", data.data);

        return data.data;

    } catch (error) {
        console.error("Fetch orders failed:", error);
    }
}

async function detailOrderProduct(productId) {
    const orders = await loadOrdersByProduct(productId);

    let orderHtml = "";

    orders.forEach(item => {
        orderHtml += `
            <tr>
                <td>${item.orderId}</td>
                <td>${item.quantity}</td>
                <td>${vnd(item.price)}</td>
                <td>${formatDate(item.orderDate)}</td>
            </tr>
        `;
    });

    document.getElementById("show-product-order-detail").innerHTML =
        orderHtml || `<tr><td colspan="4">Không có dữ liệu</td></tr>`;

    document
        .querySelector(".modal.detail-order-product")
        .classList.add("open");
}


// function detailOrderProduct(id) {
//     let orderHtml = "";
//     arr.forEach(item => {
//         if(item.id == id) {
//             orderHtml += `<tr>
//                 <td>${item.madon}</td>
//                 <td>${item.quantity}</td>
//                 <td>${vnd(item.price)}</td>
//                 <td>${formatDate(item.time)}</td>
//                 </tr>
//             `;
//         }
//     });
//     document.getElementById("show-product-order-detail").innerHTML = orderHtml
//     document.querySelector(".modal.detail-order-product").classList.add("open")
// }
