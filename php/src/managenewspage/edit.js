// เมื่อหน้าโหลดเสร็จ
document.addEventListener("DOMContentLoaded", function () {
  renderUserInfo(); // โหลดข้อมูลผู้ใช้
  bindSidebarEvents(); // ผูก event กับ sidebar
  bindLogout(); // ปุ่ม logout

  // ถ้า URL มี ?action=posted ให้แสดงข่าวเลยทันที
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("action") === "posted") {
    renderNewsManager();
  }
});

// เพิ่ม class active ตาม URL ปัจจุบัน
document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".nav-link").forEach(link => {
    if (currentPath.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
});

// โหลดข้อมูลผู้ใช้แสดงบน sidebar
function renderUserInfo() {
  fetch("../../php/src/adminpage/get_user.php")
    .then(res => res.json())
    .then(data => {
      if (data.fullname && data.email) {
        document.getElementById("userInitials").innerText = data.fullname.split(" ").map(n => n[0]).join("").toUpperCase();
        document.getElementById("userName").innerText = data.fullname;
        document.getElementById("userEmail").innerText = data.email;
      }
    })
    .catch(err => console.error("โหลดข้อมูลผู้ใช้ล้มเหลว:", err));
}

// ผูก event ให้ปุ่ม sidebar
function bindSidebarEvents() {
  document.getElementById("editBtn")?.addEventListener("click", function (e) {
    e.preventDefault();
    renderNewsManager();
  });
}

// ดึงข่าวทั้งหมดแล้วแสดงในหน้า
function renderNewsManager() {
  document.getElementById("pageContent").innerHTML = `
    <h1 class="mb-4">Edit & Delete News</h1>
    <h4 class="mb-4">ลบและแก้ไขข่าวประชาสัมพันธ์</h4>
    <hr>
    <input type="text" id="searchInput" class="form-control mb-4 custom-search" placeholder="ค้นหาหัวข้อข่าว , หมวดหมู่ข่าว...">
    <div class="row" id="newsContainer"></div>
  `;

  fetch("../../php/src/fetch_news.php")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("newsContainer");

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<p>ไม่พบข่าว</p>`;
        return;
      }

      // เก็บข่าวทั้งหมดไว้ก่อน
      let allNews = data;

      // ฟังก์ชันแสดงข่าว (ใช้เมื่อโหลดหรือกรอง)
      function renderNewsList(newsList) {
        container.innerHTML = "";

        if (newsList.length === 0) {
          container.innerHTML = `<p>ไม่พบข่าวที่ตรงกับคำค้น</p>`;
          return;
        }

        newsList.forEach(news => {
          let filename = news.ns_picture || "image_b.png";
          let imgPath = (filename === "image_b.png")
            ? "/php/src/image/" + filename     // Default
            : "/php/src/src/image/" + filename; // Uploade

          container.innerHTML += `
            <div class="col-md-4 mb-4">
              <div class="card shadow-sm">
                <img src="${imgPath}" class="card-img-top" alt="${news.ns_head}">
                <div class="card-body">
                  <h5 class="card-title">${news.ns_head}</h5>
                  <button class="btn btn-warning btn-sm me-2" onclick="editNews(${news.ns_id})">
                    <i class="fas fa-pen me-2"></i> Edit
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deleteNews(${news.ns_id})">
                    <i class="fas fa-trash me-2"></i> Delete
                  </button>
                  <p class="mt-2 mb-0 text-muted" style="font-size: 0.9rem;">
                    ${news.ns_date}<br>${news.nsg_name}
                  </p>
                </div>
              </div>
            </div>
          `;
        });
      }

      // แสดงข่าวทั้งหมดเมื่อโหลดครั้งแรก
      renderNewsList(allNews);

      // เมื่อพิมพ์ในช่องค้นหา → กรองข่าว
      document.getElementById("searchInput").addEventListener("input", function () {
        const keyword = this.value.trim().toLowerCase();

        const filtered = allNews.filter(news =>
          news.ns_head.toLowerCase().includes(keyword) |
          news.nsg_name.toLowerCase().includes(keyword)
        );

        renderNewsList(filtered);
      });
    })
    .catch(err => console.error("โหลดข่าวล้มเหลว:", err));

  loadCategoryOptions();
}


// โหลดหมวดหมู่มาใส่ใน dropdown ของ modal
function loadCategoryOptions(selectedId = "") {
  fetch("../../php/src/managenewspage/get_categories.php")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("editCategory");
      select.innerHTML = `<option value="">-- เลือกหมวดหมู่ --</option>`;
      data.forEach(category => {
        const option = document.createElement("option");
        option.value = category.nsg_id;
        option.textContent = category.nsg_name;
        if (selectedId == category.nsg_id) option.selected = true;
        select.appendChild(option);
      });
    });
}

// แสดง modal พร้อมข้อมูลข่าวเพื่อแก้ไข
window.editNews = function (id) {
  fetch(`../../php/src/managenewspage/get_news_by_id.php?id=${id}`)
    .then(res => res.json())
    .then(news => {
      document.getElementById("editNewsId").value = news.ns_id;
      document.getElementById("editTitle").value = news.ns_head;
      document.getElementById("editDetail").value = news.ns_body;
      document.getElementById("editEndDate").value = news.ns_date_end;
      document.getElementById("editCategory").value = news.ns_gns_id;

      // แก้ path รูป modal เช่นเดียวกับด้านบน
      let filename = news.ns_picture || "image_b.png";
      const img = document.getElementById("currentImage");

      const imgPath = (filename === "image_b.png")
        ? "/php/src/image/" + filename
        : "/php/src/src/image/" + filename;

      img.src = imgPath;
      img.setAttribute("data-filename", filename);
      document.getElementById("oldImage").value = filename;

      loadCategoryOptions(news.ns_gns_id);

      const modal = new bootstrap.Modal(document.getElementById("editModal"));
      modal.show();
    })
    .catch(err => alert("ไม่สามารถโหลดข้อมูลข่าวได้"));
}

// เมื่อกดบันทึกใน modal
document.addEventListener("submit", function (e) {
  if (e.target.id === "editForm") {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", document.getElementById("editNewsId").value);
    formData.append("title", document.getElementById("editTitle").value);
    formData.append("detail", document.getElementById("editDetail").value);
    formData.append("end_date", document.getElementById("editEndDate").value);
    formData.append("category_id", document.getElementById("editCategory").value);
    formData.append("old_image", document.getElementById("oldImage").value);

    const imageFile = document.getElementById("editImage").files[0];
    if (imageFile) formData.append("image", imageFile);

    fetch("../../php/src/managenewspage/updatenews.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message);
        if (result.status === "success") {
          document.querySelector("#editModal .btn-close").click();
          renderNewsManager();
        }
      })
      .catch(() => alert("ไม่สามารถอัปเดตข่าวได้"));
  }
});

// ลบข่าว
window.deleteNews = function (id) {
  console.log("ID ที่จะลบ:", id); // ตรวจสอบค่า id
  const confirmDelete = confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?");
  if (!confirmDelete) return;

  fetch("../../php/src/managenewspage/deletenews.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }) // ส่ง id เป็น JSON
  })
    .then(res => res.json())
    .then(result => {
      alert(result.message);
      if (result.status === "success") {
        renderNewsManager(); // โหลดใหม่หลังลบ
      }
    })
    .catch(err => {
      alert("เกิดข้อผิดพลาดขณะลบข่าว");
      console.error(err);
    });
};


// ปุ่ม Logout
function bindLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", function () {
    fetch("../logout.php", {
        method: "POST"
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "../index.html"; // เปลี่ยนเป็นหน้าแรกของคุณ
        } else {
            alert("Logout failed!");
        }
    })
    .catch(() => {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    });
});

}


// preview รูปภาพใหม่ก่อนอัปโหลด
const imageInput = document.getElementById("editImage");
const previewImage = document.getElementById("currentImage");
const imageWrapper = document.getElementById("imageWrapper");

// สร้างปุ่มลบ
const removeBtn = document.createElement("button");
removeBtn.innerHTML = '<i class="fas fa-times"></i>';
removeBtn.className = "btn btn-sm btn-danger position-absolute";
removeBtn.type = "button";
removeBtn.title = "ลบ";
removeBtn.style.top = "0";
removeBtn.style.right = "0";
removeBtn.style.display = "none"; // ซ่อนก่อน
imageWrapper.appendChild(removeBtn);

// เมื่อเลือกรูปใหม่
imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImage.src = e.target.result;
      removeBtn.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  }
});

// เมื่อกดปุ่มลบ
removeBtn.addEventListener("click", function () {
  imageInput.value = "";                          // เคลียร์ input file

  const oldFileName = document.getElementById("oldImage").value;
  if (oldFileName === "image_b.png") {
    previewImage.src = "/php/src/image/" + oldFileName;
  } else {
    previewImage.src = "/php/src/src/image/" + oldFileName; // หรือ "" ถ้าไม่ใช้ fallback
  }
  
  removeBtn.style.display = "none";               // ซ่อนปุ่มลบอีกครั้ง
});