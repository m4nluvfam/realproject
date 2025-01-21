// ฟังก์ชันสำหรับแสดงวันที่ปัจจุบัน
var currentDate = new Date();  // สร้างอ็อบเจ็กต์ใหม่ที่เก็บวันที่และเวลาปัจจุบัน
var formattedDate = currentDate.toLocaleDateString('th-TH', {
    day: 'numeric',    // กำหนดให้แสดงวันที่เป็นตัวเลข (เช่น 20)
    month: 'long',     // กำหนดให้แสดงชื่อเดือนเต็ม (เช่น มกราคม)
    year: 'numeric'    // กำหนดให้แสดงปีในรูปแบบตัวเลข (เช่น 2025)
});

// แสดงวันที่ใน HTML
document.getElementById('news-date').innerText = formattedDate;
// ค้นหาธาตุใน HTML ที่มี id 'news-date' และตั้งค่าข้อความภายในให้เป็นวันที่ที่จัดรูปแบบ

// ตัวอย่างข่าวที่จะแสดงในส่วนหน้า (ไม่ต้องใช้ WebSocket)
const newsItems = [
  {
    url: "https://www.thairath.co.th/news/foreign/2824925",  // URL ของข่าว
    image: "images/bg-02.jpg",  // รูปภาพที่จะแสดงในข่าว
    title: "พายุไต้ฝุ่น 'โทราจี' พัดถล่มฟิลิปปินส์เป็นลูกที่ 4 ในรอบ 1 เดือน",  // หัวข้อข่าว
    date: "11 พฤศจิกายน 2024"  // วันที่ของข่าว
  },
  {
    url: "https://www.thairath.co.th/news/crime/2814585",  // URL ของข่าว
    image: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rBo8VwuO3SphB21QIqgETZ8BMmfUAmCdknswMWHi1UM0RYfbYf.webp",  // รูปภาพของข่าว
    title: "บิ๊กต่าย สั่งถอดบทเรียนน้ำท่วมเชียงราย ตรวจเยี่ยมตำรวจ ให้กำลังใจผู้ประสบภัย",  // หัวข้อข่าว
    date: "1 ตุลาคม 2024"  // วันที่ของข่าว
  },
  {
    url: "https://www.thairath.co.th/news/local/2814559",  // URL ของข่าว
    image: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rBo8U668X6wY5Y1uCZkxPQIPlcIzWpDnRac4voLbxU9XJEkjSG.webp",  // รูปภาพของข่าว
    title: "สรุปสถานการณ์สาธารณภัย กระทบ 12 จังหวัด พร้อมเตือนพื้นที่เฝ้าระวังน้ำท่วม-ดินถล่ม",  // หัวข้อข่าว
    date: "2 ตุลาคม 2024"  // วันที่ของข่าว
  }
];

// แสดงข่าวที่มีในหน้า
const newsContainer = document.querySelector('.news-carousel');
// ค้นหาธาตุใน HTML ที่มีคลาส 'news-carousel' ซึ่งจะเป็นตัว container สำหรับแสดงข่าว

// เพิ่มข่าวทั้งหมดใน newsItems เข้าไปใน news-container
newsItems.forEach(item => {  // ใช้ forEach เพื่อวนลูปผ่านแต่ละข่าวใน array newsItems
  const newNewsItem = document.createElement('div');  // สร้าง div ใหม่สำหรับแต่ละข่าว
  newNewsItem.classList.add('news-item');  // เพิ่มคลาส 'news-item' ให้กับ div ใหม่

  newNewsItem.innerHTML = `
    <a href="${item.url}" target="_blank">
      <img src="${item.image}" alt="ข่าวใหม่">  // แสดงรูปภาพของข่าว
      <h3>${item.title}</h3>  // แสดงหัวข้อของข่าว
    </a>
    <p class="news-date"><i class="fas fa-clock"></i> <span class="news-date-value">${item.date}</span></p>  // แสดงวันที่ของข่าว
  `;
  newsContainer.appendChild(newNewsItem);  // เพิ่ม div ของข่าวใหม่ที่สร้างขึ้นไปยัง container สำหรับแสดงข่าว
});


// ดึงข้อมูลข่าวจาก PHP API
fetch('fetch_news.php')
    .then(response => response.json())
    .then(newsItems => {
        const newsContainer = document.querySelector('.news-carousel');
        newsContainer.innerHTML = ''; // ล้างข้อมูลเดิม

        newsItems.forEach(item => {
            const newNewsItem = document.createElement('div');
            newNewsItem.classList.add('news-item');

            newNewsItem.innerHTML = `
                <a href="${item.url}" target="_blank">
                    <img src="${item.image}" alt="${item.title}">
                    <h3>${item.title}</h3>
                </a>
                <p class="news-date"><i class="fas fa-clock"></i> <span class="news-date-value">${item.date}</span></p>
            `;
            newsContainer.appendChild(newNewsItem);
        });
    })
    .catch(error => console.error('Error fetching news:', error));
