<?php
header('Content-Type: application/json');
include '../connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "ไม่มีข้อมูลที่ส่งมา"]);
    exit;
}

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');
$roleText = trim($data['role'] ?? '');

if (!$fullname || !$email || !$username || !$password || !$roleText) {
    echo json_encode(["status" => "error", "message" => "กรอกข้อมูลไม่ครบ"]);
    exit;
}

$role = ($roleText === "Admin") ? 2 : 1;

// ตรวจสอบว่า username ซ้ำหรือไม่
$checkStmt = $conn->prepare("SELECT COUNT(*) FROM tb_editor WHERE ed_username = ?");
$checkStmt->bind_param("s", $username);
$checkStmt->execute();
$checkStmt->bind_result($count);
$checkStmt->fetch();
$checkStmt->close();

if ($count > 0) {
    echo json_encode(["status" => "error", "message" => "Username นี้มีอยู่แล้ว"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tb_editor (ed_name, ed_email, ed_username, ed_password, ed_role) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $fullname, $email, $username, $password, $role);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "เพิ่มผู้ใช้สำเร็จ"]);
} else {
    echo json_encode(["status" => "error", "message" => "เกิดข้อผิดพลาดในการบันทึก"]);
}

$stmt->close();
$conn->close();
?>
