<?php
header("Content-Type: application/json");

// เชื่อมต่อฐานข้อมูล
include('../../../connect.php');

// ✅ รับ JSON ที่ถูกส่งมา
$input = json_decode(file_get_contents("php://input"), true);
$id = $input['id'] ?? '';

if (!$id) {
    echo json_encode([
        "status" => "error",
        "message" => "ไม่พบ ID ข่าว"
    ]);
    exit;
}

// ✅ ลบข่าวจากฐานข้อมูล
$sql = "DELETE FROM tb_news WHERE ns_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL Prepare Failed",
        "error_detail" => $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $id);
$success = $stmt->execute();

echo json_encode([
    "status" => $success ? "success" : "error",
    "message" => $success ? "ลบข่าวสำเร็จ" : "ลบข่าวไม่สำเร็จ",
    "error_detail" => $success ? null : $stmt->error
]);

$stmt->close();
$conn->close();
?>