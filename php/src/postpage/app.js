// แสดงตัวอย่างภาพ
document.getElementById('formFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
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