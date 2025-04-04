<?php
session_start();
session_destroy();
http_response_code(200); // ✅ เพิ่มบรรทัดนี้เพื่อให้แน่ใจว่า browser เห็นเป็น OK
echo "OK";
