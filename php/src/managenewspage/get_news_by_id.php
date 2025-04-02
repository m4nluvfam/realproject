<?php
// เชื่อมต่อฐานข้อมูล
include '../../../connect.php';

// รับค่า ID ที่ส่งมา
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);

    $stmt = $conn->prepare("
        SELECT 
            tb_news.ns_id, 
            tb_news.ns_head, 
            tb_news.ns_body, 
            tb_news.ns_picture, 
            tb_news.ns_date, 
            tb_news.ns_date_end, 
            tb_news.ns_gns_id, 
            tb_news_group.nsg_name 
        FROM tb_news 
        LEFT JOIN tb_news_group ON tb_news.ns_gns_id = tb_news_group.nsg_id
        WHERE tb_news.ns_id = ?
    ");

    if (!$stmt) {
        echo json_encode(["error" => "SQL Prepare Failed", "details" => $conn->error]);
        exit;
    }
    
    $stmt->bind_param("i", $id);
    $stmt->execute();

    $result = $stmt->get_result();
    $news = $result->fetch_assoc();

    if ($news) {
        echo json_encode($news);
    } else {
        echo json_encode(["error" => "ไม่พบข่าวที่ต้องการ"]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "ไม่มี ID ที่ส่งมา"]);
}

$conn->close();
?>
