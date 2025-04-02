<?php
header("Content-Type: application/json");
include '../../../connect.php';

$sql = "SELECT nsg_id, nsg_name FROM tb_news_group ORDER BY nsg_id ASC";
$result = $conn->query($sql);

$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}
echo json_encode($categories);
?>
