<?php
include '../connect.php';

header('Content-Type: application/json');

// รับข้อมูล JSON จาก JavaScript
$data = json_decode(file_get_contents('php://input'), true);

// ตรวจสอบว่าข้อมูลครบไหม
if (!isset($data['id'], $data['fullname'], $data['email'], $data['username'], $data['password'], $data['role'])) {
    echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบ']);
    exit;
}

$id = $data['id'];
$fullname = $data['fullname'];
$email = $data['email'];
$username = $data['username'];
$password = $data['password'];
$role = $data['role'] === 'Admin' ? 2 : 1;

// เตรียม SQL สำหรับอัปเดต
$sql = "UPDATE tb_editor SET ed_name=?, ed_email=?, ed_username=?, ed_password=?, ed_role=? WHERE ed_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssii", $fullname, $email, $username, $password, $role, $id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $stmt->error]);
}

$stmt->close();
$conn->close();
