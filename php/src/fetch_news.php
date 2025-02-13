<?php
header('Content-Type: application/json');

$host = 'db';
$user = 'root';
$pass = '123456';
$db = 'db_project';

// เชื่อมต่อฐานข้อมูล
$conn = new mysqli($host, $user, $pass, $db);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// รับค่าหมวดหมู่จาก query string
$category = isset($_GET['category']) ? $_GET['category'] : 'news';

// กำหนด SQL ตามหมวดหมู่ที่เลือก
$sql = "SELECT 
            tb_news.ns_id, 
            tb_news.ns_head, 
            tb_news.ns_body, 
            tb_news.ns_picture, 
            tb_news.ns_date, 
            tb_news.ns_date_end, 
            tb_news.ns_gns_id, 
            tb_news_group.nsg_name 
        FROM 
            tb_news
        LEFT JOIN 
            tb_news_group
        ON 
            tb_news.ns_gns_id = tb_news_group.nsg_id";

if ($category === 'news') {
    $sql .= " WHERE tb_news.ns_gns_id != 'facebook'"; // ดึงเฉพาะข่าวที่ไม่ใช่ Facebook
} elseif ($category === 'facebook') {
    $sql .= " WHERE tb_news.ns_gns_id = 'facebook'"; // ดึงเฉพาะข่าวจาก Facebook
}

$sql .= " ORDER BY tb_news.ns_date DESC";

$result = $conn->query($sql);

// ตรวจสอบผลลัพธ์ของคำสั่ง SQL
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $conn->error]);
    exit;
}

// เตรียมข้อมูลสำหรับส่งกลับ
$news = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $news[] = $row;
    }
} else {
    http_response_code(200);
    echo json_encode(['message' => 'No news found']);
    $conn->close();
    exit;
}

// ส่งข้อมูลข่าวในรูปแบบ JSON
http_response_code(200);
echo json_encode($news, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// ปิดการเชื่อมต่อฐานข้อมูล
$conn->close();
?>