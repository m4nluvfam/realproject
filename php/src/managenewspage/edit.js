document.addEventListener("DOMContentLoaded", function () {
    // โหลดข้อมูลผู้ใช้
    fetch("../../php/src/adminpage/get_user.php")
        .then(res => res.json())
        .then(data => {
            if (data.fullname && data.email) {
                const userInitials = data.fullname.split(" ").map(name => name[0].toUpperCase()).join("");
                document.getElementById("userInitials").innerText = userInitials;
                document.getElementById("userName").innerText = data.fullname;
                document.getElementById("userEmail").innerText = data.email;
            } else {
                alert("ไม่สามารถโหลดข้อมูลผู้ใช้");
            }
        })
        .catch(err => console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้:", err));

    // จัดการ Logout
    document.getElementById("logoutBtn")?.addEventListener("click", function () {
        fetch("logout.php", { method: "POST" })
            .then(response => {
                if (response.ok) {
                    window.location.href = "../index.html";
                } else {
                    alert("Logout failed!");
                }
            })
            .catch(() => {
                alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            });
    });

    // เมื่อคลิก "ลบและแก้ไขข้อมูล"
    document.getElementById("editBtn")?.addEventListener("click", function (e) {
        e.preventDefault();

        document.getElementById("pageContent").innerHTML = `
            <h1 class="mb-4">ลบและแก้ไขข่าว</h1>
            <input type="text" id="searchInput" class="form-control mb-4" placeholder="ค้นหา..........">
            <div class="row" id="newsContainer"></div>
        `;

        

        // โหลดข่าวทั้งหมดจาก backend
        fetch("../../php/src/fetch_news.php")
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("newsContainer");

                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(news => {

                        const picture = news.ns_picture ? news.ns_picture : '/image/image_b.png';
                        container.innerHTML += `
                            <div class="col-md-4 mb-4">
                                <div class="card shadow-sm">
                                    <img src="${picture}" class="card-img-top" alt="${news.ns_head}">
                                    <div class="card-body">
                                        <h5 class="card-title">${news.ns_head}</h5>
                                        <button class="btn btn-warning btn-sm me-2" onclick="editNews(${news.ns_id})">
                                            <i class="fas fa-pen"></i> แก้ไข
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteNews(${news.id})">
                                            <i class="fas fa-trash"></i> ลบ
                                        </button>
                                        <p class="mt-2 mb-0 text-muted" style="font-size: 0.9rem;">
                                            ${news.ns_date}<br>${news.nsg_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    container.innerHTML = `<p>ไม่พบข่าว</p>`;
                }
            })
            .catch(err => {
                console.error("เกิดข้อผิดพลาด:", err);
                document.getElementById("newsContainer").innerHTML = `<p class="text-danger">เกิดข้อผิดพลาดในการโหลดข่าว</p>`;
            });
    });

    // รูปใหม่
    const imageInput = document.getElementById("editImage");
    const previewImage = document.getElementById("currentImage");

    if (imageInput && previewImage) {
        imageInput.addEventListener("change", function () {
            const file = imageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

});

// ฟังก์ชันแก้ไขข่าว (เปิด modal พร้อมกรอกข้อมูล)
window.editNews = function (id) {
    fetch("../../php/src/managenewspage/get_news_by_id.php?id=" + id)
        .then(res => res.json())
        .then(news => {
            document.getElementById("editNewsId").value = news.ns_id;
            document.getElementById("editTitle").value = news.ns_head;
            document.getElementById("editDetail").value = news.ns_body;  // รายละเอียด
            document.getElementById("editEndDate").value = news.ns_end_date; // ✅ วันที่สิ้นสุด
            document.getElementById("editCategory").value = news.nsg_name; // หมวดหมู่ / หน่วยงาน

            // แสดงรูปเดิม (หากมี)
            const img = document.getElementById("currentImage");
            img.src = news.ns_picture ? news.ns_picture : '/image/image_b.png';


            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        })
        .catch(err => {
            console.error("โหลดข้อมูลข่าวล้มเหลว:", err);
            alert("ไม่สามารถโหลดข่าวได้");
        });
};

// เมื่อ submit ฟอร์มแก้ไข
document.addEventListener("submit", function (e) {
    if (e.target.id === "editForm") {
        e.preventDefault();

        const updatedData = {
            id: document.getElementById("editNewsId").value,
            title: document.getElementById("editTitle").value,
            detail: document.getElementById("editDetail").value,
            end_date: document.getElementById("editEndDate").value,
            category: document.getElementById("editCategory").value
        };

        fetch("../../php/src/update_news.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        .then(res => res.text())
        .then(result => {
            alert("อัปเดตเรียบร้อยแล้ว");
            document.querySelector("#editModal .btn-close").click();
            document.getElementById("editBtn").click(); // โหลดข่าวใหม่
        })
        .catch(err => {
            console.error("อัปเดตข่าวล้มเหลว:", err);
            alert("อัปเดตไม่สำเร็จ");
        });
    }
});
