<?php
include 'connect.php'; // เชื่อมต่อฐานข้อมูล

$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data['id']) && isset($data['head']) &&
    isset($data['body']) && isset($data['category'])
) {
    $id = intval($data['id']);
    $head = $data['head'];
    $body = $data['body'];
    $category = $data['category'];
    $picture = $data['picture'];

    $stmt = $conn->prepare("
        UPDATE tb_news 
        SET ns_head = ?, ns_body = ?, nsg_name = ?, ns_picture = ? 
        WHERE ns_id = ?
    ");
    $stmt->bind_param("ssssi", $head, $body, $category, $picture, $id);

    if ($stmt->execute()) {
        echo "อัปเดตข่าวสำเร็จ";
    } else {
        echo "เกิดข้อผิดพลาดในการอัปเดตข่าว";
    }

    $stmt->close();
    $conn->close();
} else {
    echo "ข้อมูลไม่ครบถ้วน";
}
?>
