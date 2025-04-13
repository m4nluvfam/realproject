<?php
header("Content-Type: application/json");

// เชื่อมต่อฐานข้อมูล
include('../../../connect.php');

$response = ["status" => "error", "message" => "เกิดข้อผิดพลาดในการอัปเดต"];

// รับค่าจาก FormData
$id = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$detail = $_POST['detail'] ?? '';
$end_date = $_POST['end_date'] ?? '';
$category_id = $_POST['category_id'] ?? '';
$old_image = $_POST['old_image'] ?? '';

// ป้องกันค่าผิดพลาด ที่ได้ค่า 0 หรือค่าว่าง จากฝั่ง JS
// if ($old_image === '0') {
    // $old_image = '';
// }

// ตั้งชื่อไฟล์ภาพเริ่มต้นเป็นรูปเดิม
// $image_file_to_save = $old_image;

// ตรวจสอบว่า old_image มีค่าเป็น "0" หรือว่าง → ใช้ null แทน
if ($old_image === '0' || $old_image === '') {
    $image_file_to_save = "image_b.png";
} else {
    $image_file_to_save = basename($old_image); // เอาเฉพาะชื่อไฟล์
}

// ตรวจสอบว่ามีการอัปโหลดรูปใหม่มาหรือไม่
if (!empty($_FILES['image']['name'])) {
    $upload_dir = '../../src/src/image/'; // โฟลเดอร์ที่ใช้เก็บรูปจริง
    $uploaded_tmp = $_FILES['image']['tmp_name'];

    // สร้างชื่อไฟล์ใหม่ให้เป็น image[id].นามสกุล
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $uploaded_name = "image" . $id . "." . strtolower($ext);
    $target_path = $upload_dir . $uploaded_name;

    // อัปโหลดรูปใหม่
    if (move_uploaded_file($uploaded_tmp, $target_path)) {
        $image_file_to_save = $uploaded_name;

        // ถ้ามีรูปเดิม → ลบออกจากระบบ
        if (!empty($old_image)) {
            $old_filename = basename($old_image); // เอาแค่ชื่อไฟล์ออกมา
            $old_path = $upload_dir . $old_filename;

            if ($old_filename !== $uploaded_name && $old_filename !== 'image_b.png' && file_exists($old_path)) {
                unlink($old_path);
            }
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "อัปโหลดรูปภาพล้มเหลว"
        ]);
        exit;
    }
}

// เตรียม SQL สำหรับอัปเดตข้อมูล
$sql = "UPDATE tb_news 
        SET ns_head = ?, 
            ns_body = ?, 
            ns_date_end = ?, 
            ns_gns_id = ?, 
            ns_picture = ? 
        WHERE ns_id = ?";

// เตรียม statement
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL Prepare Failed",
        "error_detail" => $conn->error
    ]);
    exit;
}

// bind ค่าที่จะส่งเข้า query (s = string, i = integer)
$stmt->bind_param("sssssi", $title, $detail, $end_date, $category_id, $image_file_to_save, $id);

// รันคำสั่ง SQL
$success = $stmt->execute();

// ตอบกลับผลลัพธ์
if ($success) {
    echo json_encode([
        "status" => "success",
        "message" => "อัปเดตข่าวสำเร็จ"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "อัปเดตข่าวไม่สำเร็จ",
        "error_detail" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>