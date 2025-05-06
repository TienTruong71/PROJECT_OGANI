/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2023 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    // 
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
      
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});
    

document.addEventListener('DOMContentLoaded', function () {


 // Xử lý sự kiện lọc theo trạng thái 
 const buttonsStatus = document.querySelectorAll("[data-status]");
 if (buttonsStatus.length > 0) {
   const url = new URL(window.location.href); 
   const currentStatus = url.searchParams.get("status") || "";

   buttonsStatus.forEach(button => {
     button.classList.remove("active");
     if (button.getAttribute("data-status") === currentStatus) {
       button.classList.add("active");
     }
     button.addEventListener("click", function () {
       const status = button.getAttribute("data-status");
       const newUrl = new URL(window.location.href);
       if (status) {
         newUrl.searchParams.set("status", status);
       } else {
         newUrl.searchParams.delete("status");
       }
       window.location.href = newUrl.href;
     });
   });
 }

  //  Xử lý click các nút "Cập nhật trạng thái" + "Xem chi tiết" 
  document.addEventListener('click', async function (event) {
    // Click cập nhật trạng thái
    const updateButton = event.target.closest('.btn-update-status');
    if (updateButton) {
      const orderId = updateButton.dataset.id;
      const newStatus = updateButton.dataset.status;

      if (!confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${newStatus}" không?`)) return;

      try {
        const response = await fetch(`/admin/order/${orderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();

        if (data.success) {
          alert('Cập nhật trạng thái thành công!');
          window.location.replace('/admin/order');         
        } else {
          alert('Lỗi: ' + data.message);
        }
      } catch (err) {
        console.error(err);
        alert('Đã xảy ra lỗi khi cập nhật trạng thái.');
      }
      return; 
    }

    // Click xem chi tiết đơn hàng
    const detailButton = event.target.closest('.btn-order-detail');
    if (detailButton) {
      const orderId = detailButton.getAttribute('data-id');
      if (orderId) {  
            window.location.href = `/admin/order/${orderId}`;
      }
    }
  });

      // Cập nhật trạng thái cho tất cả đơn hàng được chọn
  document.getElementById('applyBulkAction').addEventListener('click', async function() {


    const selectedOrders = Array.from(document.querySelectorAll('.order-checkbox:checked')).map(checkbox => checkbox.value);
    const newStatus = document.getElementById('bulkAction').value;

    if (selectedOrders.length === 0) {
        alert('Vui lòng chọn ít nhất một đơn hàng');
        return;
    }

    try {
        const response = await fetch('/admin/order/apply-bulk-action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderIds: selectedOrders, newStatus: newStatus })
        });

        const data = await response.json();
        if (response.ok) {
            alert(`Đã cập nhật trạng thái cho ${data.updatedCount} đơn hàng.`);
            window.location.replace('/admin/order');         
        } else {
            alert(data.message || 'Đã có lỗi xảy ra');
        }
    } catch (error) {
        alert('Đã có lỗi xảy ra khi gửi yêu cầu');
    }
});
});




       
 

      



