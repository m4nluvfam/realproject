<?php
// ตั้งค่าการเชื่อมต่อฐานข้อมูล
$host = "db"; // ชื่อโฮสต์
$username = "root"; // ชื่อผู้ใช้ฐานข้อมูล
$password = "123456"; // รหัสผ่าน (เว้นว่างถ้าคุณไม่ได้ตั้งรหัสผ่าน)
$dbname = "db_project"; // ชื่อฐานข้อมูล

// เชื่อมต่อฐานข้อมูล
$conn = new mysqli($host, $username, $password, $dbname);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("การเชื่อมต่อฐานข้อมูลล้มเหลว: " . $conn->connect_error);
}

// สร้างคำสั่ง SQL
$sql = "SELECT * FROM news";
$result = $conn->query($sql);

// ตรวจสอบว่ามีข้อมูลหรือไม่
if ($result->num_rows > 0) {
    // เก็บข้อมูลในรูปแบบ JSON
    $news = array();
    while ($row = $result->fetch_assoc()) {
        $news[] = $row;
    }
    echo json_encode($news);
} else {
    echo json_encode([]);
}

// ปิดการเชื่อมต่อ
$conn->close();
?>
