function vnd(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "/" + mm + "/" + yyyy;
}

function userStatus(status){
  if (status === 1) {
    return 'Đang hoạt động';
  } else {
    return 'Vô hiệu';
  }
}

module.exports = { vnd, formatDate, userStatus };
