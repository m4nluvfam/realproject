document.getElementById('search-toggle').addEventListener('click', function () {
    const searchBox = document.getElementById('search-box-wrapper');
    searchBox.classList.toggle('d-none');
});

// เฟซบุ๊ก
function switchPage(pageId) {
    // ซ่อนทุกเพจ
    document.querySelectorAll('.fb-tab-page').forEach(el => el.style.display = 'none');

    // แสดงเพจที่เลือก
    document.getElementById(pageId).style.display = 'block';

    // สลับ class ปุ่ม active
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const clickedButton = Array.from(document.querySelectorAll('.tab-button')).find(btn =>
      btn.getAttribute('onclick').includes(pageId)
    );
    clickedButton.classList.add('active');

    // บอก Facebook ให้ render ใหม่ (ถ้ายังไม่แสดง)
    if (typeof FB !== 'undefined') {
      FB.XFBML.parse(document.getElementById(pageId));
    }
  }

  // -------------------------------------------------------------------
  // ข่าวจากฐานข้อมูล
  document.addEventListener("DOMContentLoaded", function () {
    fetchNewsFromDatabase();
  });
  
  function fetchNewsFromDatabase() {
    const container = document.getElementById("newsArea");
    fetch('/fetch_news.php?category=news')
      .then(response => response.json())
      .then(data => {
        container.innerHTML = '';
        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = '<p>ไม่มีข่าวในขณะนี้</p>';
          return;
        }
        let rowDiv = null;
        data.forEach((news, index) => {
          const picture = news.ns_picture ? news.ns_picture : '/image/image_b.png';
          const newsHTML = `
            <div class="news-item" onclick='openNewsModal(${JSON.stringify(news)})'>
              <a href="javascript:void(0);">
                <img src="${picture}" alt="${news.ns_head}">
                <h3 class="news-head">${news.ns_head}</h3>
              </a>
              <div class="news-footer">
                <p class="news-date">
                  <i class="fas fa-clock"></i> ${new Date(news.ns_date).toLocaleDateString()}
                </p>
                <span class="news-category">${news.nsg_name}</span>
              </div>
            </div>`;
  
          if (index % 3 === 0) {
            rowDiv = document.createElement("div");
            rowDiv.classList.add("news-row");
            container.appendChild(rowDiv);
          }
          rowDiv.innerHTML += newsHTML;
        });
      })
      .catch(error => {
        console.error('Error fetching news:', error);
        container.innerHTML = `<p style="color: red;">ไม่สามารถโหลดข่าวได้ (${error.message})</p>`;
      });
  }
  
  function openNewsModal(news) {
    document.getElementById("modalTitle").innerText = news.ns_head;
    document.getElementById("modalImage").src = news.ns_picture ? news.ns_picture : "/image/image_b.png";
    document.getElementById("modalBody").innerText = news.ns_body;
    document.getElementById("modalCategory").innerText = `ที่มา: ${news.nsg_name}`;
    document.getElementById("modalDate").innerHTML = `<i class='fas fa-clock'></i> ${new Date(news.ns_date).toLocaleDateString()}`;
    document.getElementById("newsModal").style.display = "flex";
  }
  
  function closeNewsModal() {
    document.getElementById("newsModal").style.display = "none";
  }

