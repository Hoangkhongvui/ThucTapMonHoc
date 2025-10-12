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

    fetch(`/admin/product/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch product");
            return response.json();
        })
        .then(product => {
            document.querySelector(".upload-image-preview").src = product.img || "";
            document.getElementById("name").value = product.title || "";
            document.getElementById("price").value = product.price || "";
            document.getElementById("description").value = product.desc || "";
            document.getElementById("category").value = product.category || "";
        })
        .catch(error => {
            console.error("Error fetching product:", error);
            alert("Unable to load product data.");
        });
}

function confirmDeletion(event) {
    event.preventDefault();

    const isConfirmed = confirm("Bạn có chắc muốn xóa?");

    if (isConfirmed) {
        event.target.closest('form').submit();
    }
}
