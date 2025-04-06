let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelector(".add-product").classList.add("open");
    document.querySelector('.add-product-form').action = '/admin/product/create';
});

let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");
for (let i = 0; i < closePopup.length; i++) {
    closePopup[i].onclick = () => {
        modalPopup[i].classList.remove("open");
    };
}

function uploadImage(el) {
    let path = "./assets/img/products/" + el.value.split("\\")[2];
    document.querySelector(".upload-image-preview").setAttribute("src", path);
}

function editProduct(id) {
    // let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    // let index = products.findIndex(item => {
    //     return item.id == id;
    // })
    // indexCur = index;
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelector(".add-product").classList.add("open");
    document.querySelector('.add-product-form').action = '/admin/product/update';
    document.querySelector('input#productId').value = id;
    //
    document.querySelector(".upload-image-preview").src = products[id - 1].img;
    document.getElementById("name").value = products[id - 1].title;
    document.getElementById("price").value = products[id - 1].price;
    document.getElementById("description").value = products[id - 1].desc;
    document.getElementById("category").value = products[id - 1].category;
}

function confirmDeletion(event) {
    event.preventDefault();

    const isConfirmed = confirm("Bạn có chắc muốn xóa?");

    if (isConfirmed) {
        event.target.closest('form').submit();
    }
}
