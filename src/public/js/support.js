document.addEventListener("DOMContentLoaded", function () {
    const rows = document.querySelectorAll(".support-row");
    const replyModalInstance = new bootstrap.Modal(document.getElementById("replyModal"));
    const replyModalElement = document.getElementById("replyModal");
    const form = document.getElementById("replyForm");
    const replyContent = document.getElementById("replyContent");

    // Double click row để mở modal
    rows.forEach(row => {
        row.addEventListener("dblclick", () => {
            const id = row.getAttribute("data-id");
            const subject = row.querySelector("td:nth-child(4)").innerText;
            const message = row.querySelector("td:nth-child(5)").innerText;

            document.getElementById("modalSubject").value = subject;  // Đây là title
            document.getElementById("modalMessage").value = message;
            document.getElementById("supportId").value = id;
            replyContent.value = "";
            replyContent.classList.remove("is-invalid");

            replyModalInstance.show();
        });
    });

    // Khi click nút "Phản hồi"
    replyModalElement.addEventListener("show.bs.modal", function (event) {
        const button = event.relatedTarget;
        if (!button) return; 

        const supportId = button.getAttribute("data-support-id");
        const subject = button.getAttribute("data-subject");
        const message = button.getAttribute("data-message");

        document.getElementById("modalSubject").value = subject;  // Đây là title
        document.getElementById("modalMessage").value = message;
        document.getElementById("supportId").value = supportId;
        replyContent.value = "";
        replyContent.classList.remove("is-invalid");
    });

    // Gửi phản hồi
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!replyContent.value.trim()) {
            replyContent.classList.add("is-invalid");
            return;
        }

        const supportId = document.getElementById("supportId").value;
        const content = replyContent.value.trim();
        const title = document.getElementById("modalSubject").value.trim();  // Gửi thêm title

        if (!title) {
            alert("Tiêu đề phản hồi là bắt buộc");
            return;
        }

        fetch(`/admin/support/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: supportId, reply: content, title: title })  // Gửi title cùng với reply
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                replyModalInstance.hide();
                location.reload();
            } else {
                alert("Phản hồi thất bại.");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Có lỗi xảy ra khi gửi phản hồi.");
        });
    });
});
