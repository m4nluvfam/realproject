<?php
session_start();
session_unset();     // ลบตัวแปร session ทั้งหมด
session_destroy();   // ทำลาย session
http_response_code(200); // ส่งสถานะ OK กลับไป
exit();
?>
