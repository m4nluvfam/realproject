<?php
// แสดง error (สำหรับ debug)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include '../connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = trim($_POST['title']);
    $content = trim($_POST['content']);
    $position = trim($_POST['position']);

    // เริ่มต้น path ว่างไว้ก่อน
    $imagePath = "";

    // 1. บันทึกข้อมูลข่าว (ยังไม่ใส่ชื่อภาพ)
    $sql = "INSERT INTO tb_news (ns_head, ns_body, ns_picture, ns_gns_id) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "เตรียม SQL ไม่สำเร็จ: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("ssss", $title, $content, $imagePath, $position);

    if ($stmt->execute()) {
        $insertId = $stmt->insert_id;
        $stmt->close();

        // 2. ถ้ามีรูปภาพแนบมาด้วย
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageTmpPath = $_FILES['image']['tmp_name'];
            $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $newImageName = "image" . $insertId . "." . $ext;

            // 🔁 เปลี่ยน path ไปที่ src/image/
            $uploadDir = __DIR__ . "/../src/image/";
            $finalPath = $uploadDir . $newImageName;

            // ตรวจสอบหรือสร้างโฟลเดอร์
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // ย้ายไฟล์และอัปเดต path ใน DB
            if (move_uploaded_file($imageTmpPath, $finalPath)) {
                $imagePath = "/src/image/" . $newImageName;

                $updateSql = "UPDATE tb_news SET ns_picture = ? WHERE ns_id = ?";
                $updateStmt = $conn->prepare($updateSql);
                if ($updateStmt) {
                    $updateStmt->bind_param("si", $imagePath, $insertId);
                    $updateStmt->execute();
                    $updateStmt->close();
                } else {
                    echo json_encode(["status" => "error", "message" => "เตรียม UPDATE ไม่สำเร็จ: " . $conn->error]);
                    exit;
                }
            } else {
                echo json_encode(["status" => "error", "message" => "ไม่สามารถย้ายรูปภาพไปยัง src/image/ ได้"]);
                exit;
            }
        }

        echo json_encode([
            "status" => "success",
            "message" => "โพสต์สำเร็จ",
            "id" => $insertId,
            "imagePath" => $imagePath
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "บันทึกข่าวไม่สำเร็จ: " . $stmt->error]);
        $stmt->close();
    }

    $conn->close();
}
?>
