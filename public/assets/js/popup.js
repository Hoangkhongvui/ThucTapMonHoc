// Close popup
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    })
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    console.log(modalContainer)
    body.style.overflow = "auto";
}

// Toast message
//Toast message
function toast({
    title = 'Success',
    message = 'Tạo tài khoản thành công',
    type = 'success',
    duration = 3000
}){
    const main = document.getElementById('toast');
    if(main){
        const toast = document.createElement('div');
        //Auto remove toast
        const autoRemove = setTimeout(function(){
            main.removeChild(toast);
        },duration+1000);
        //Remove toast when click btn close
        toast.onclick = function(e){
            if(e.target.closest('.fa-regular')){
                main.removeChild(toast);
                clearTimeout(autoRemove);
            }
        }
        const colors = {
            success: '#47d864',
            info: '#2f86eb',
            warning: '#ffc021',
            error: '#ff6243'
        }
        const icons = {
            success: 'fa-light fa-check',
            info: 'fa-solid fa-circle-info',
            warning: 'fa-solid fa-triangle-exclamation',
            error: 'fa-solid fa-bug'
        };
        const color = colors[type];
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);
        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInLeft ease 0.3s, fadeOut linear 1s ${delay}s forwards`;
        toast.innerHTML = `<div class="toast__private">
        <div class="toast__icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast__body">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__msg">
                ${message}
            </p>
        </div>
        <div class="toast__close">
            <i class="fa-regular fa-circle-xmark"></i>
        </div>
    </div>
    <div class="toast__background"style="background-color: ${color};">
    </div>`
    main.appendChild(toast);
    }
}
