// แสดงตัวอย่างภาพ
const fileInput = document.getElementById('formFile');
const preview = document.getElementById('imagePreview');
const container = document.getElementById('imageContainer');

// สร้างปุ่มลบ
const removeBtn = document.createElement('button');
removeBtn.type = "button";
removeBtn.className = "btn btn-sm btn-danger position-absolute";
removeBtn.title = "ลบ";
removeBtn.innerHTML = '<i class="fas fa-times"></i>';
removeBtn.style.top = "0";
removeBtn.style.right = "0";
removeBtn.style.display = "none"; // ซ่อนก่อน
container.appendChild(removeBtn);

// เมื่อเลือกไฟล์รูป
fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            removeBtn.style.display = "inline-block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = 'none';
        removeBtn.style.display = "none";
    }
});

// เมื่อกดลบ
removeBtn.addEventListener("click", () => {
    fileInput.value = "";              // ล้างไฟล์
    preview.src = "";
    preview.style.display = "none";   // ซ่อน preview
    removeBtn.style.display = "none"; // ซ่อนปุ่มลบ
});


// ฟังก์ชันส่งฟอร์ม
document.getElementById('submitButton').addEventListener('click', function () {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const position = document.getElementById('positionSelect').value;
    const image = document.getElementById('formFile').files[0];

    if (!title || !content || !position) {
        alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    // ยืนยันการโพส
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการโพสต์ข่าวนี้?')) {
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('position', position);
    if (image) {
        formData.append('image', image);
    }

    // เช็คข้อมูลที่ส่ง (Debug)
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
    }

    fetch('post.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.text())
        .then(response => {
            console.log('Response:', response);
            if (response.includes("success")) {
                alert('โพสต์สำเร็จแล้ว!');
                window.location.href = '../managenewspage/edit.html?action=posted';
            } else {
                alert('เกิดข้อผิดพลาด: ' + response);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err);
        });
});