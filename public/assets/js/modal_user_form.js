function openCreateAccount() {
    document.querySelector(".signup").classList.add("open");
    document.querySelector(".add-user-form").action = '/admin/user/create';
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "block"
    })
}

document.querySelector(".modal.signup .modal-close").addEventListener("click",() => {
    signUpFormReset();
})

function signUpFormReset() {
    document.getElementById('fullname').value = ""
    document.getElementById('phone').value = ""
    document.getElementById('password').value = ""
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
}

function editAccount(id) {
    document.querySelector(".signup").classList.add("open");
    document.querySelector(".add-user-form").action = '/admin/user/update';
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "block"
    })

    document.querySelector('input#userId').value = id;

    fetch(`/admin/user/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch user");
            return response.json();
        })
        .then(user => {
            document.getElementById("fullname").value = user.fullname || "";
            document.getElementById("phone").value = user.phone || "";
            document.getElementById("password").value = user.password || "";
            document.getElementById("userStatus").checked = user.status == 1 ? true : false;
        })
        .catch(error => {
            console.error("Error fetching product:", error);
            alert("Unable to load product data.");
        });
}
