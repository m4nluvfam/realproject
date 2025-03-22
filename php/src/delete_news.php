<?php
include 'connect.php'; // เชื่อมต่อฐานข้อมูล

if (isset($_GET['id'])) {
    $newsId = intval($_GET['id']);

    $stmt = $conn->prepare("DELETE FROM tb_news WHERE ns_id = ?");
    $stmt->bind_param("i", $newsId);

    if ($stmt->execute()) {
        echo "ลบข่าวสำเร็จ";
    } else {
        echo "เกิดข้อผิดพลาดในการลบข่าว";
    }

    $stmt->close();
    $conn->close();
} else {
    echo "ไม่พบ ID ข่าว";
}
?>