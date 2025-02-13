//รองรับทั้ง Full UI และ Notification UI
document.addEventListener("DOMContentLoaded", function () {
    adjustUI(); // ปรับ UI ตามขนาดหน้าจอ
    
    if (document.getElementById('fullUI')) {
        document.getElementById('fullUI').style.display = 'block';
        loadNews('news', false);
    }
    if (document.getElementById('notificationUI')) {
        document.getElementById('notificationUI').style.display = 'none'; // ซ่อน Notification UI บนหน้าจอใหญ่
    }
    // Event Listener สำหรับค้นหาข่าว
    document.getElementById("searchInput").addEventListener("input", function () {
        searchNews();
    });
});

// ฟังก์ชันกรอกข้อมูลข่าว
function searchNews() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let newsItems = document.querySelectorAll("#news-container .news-item, #news-container-noti .news-item-noti");
    let noResultsMessage = document.getElementById("noResultsMessage");
    let found = false;

    // ตรวจสอบและลบข้อความ "ไม่พบข่าวที่ค้นหา" ก่อนการค้นหาใหม่
    if (noResultsMessage) {
        noResultsMessage.remove();
    }

    newsItems.forEach(item => {
        let title = item.querySelector("h3").innerText.toLowerCase();
        let category = item.querySelector(".news-category, .news-category-noti").innerText.toLowerCase();
        
        if (title.includes(query) || category.includes(query)) {
            item.style.display = "block";
            found = true;
        } else {
            item.style.display = "none";
        }
    });
    
    // แสดงข้อความถ้าไม่พบข่าว
    if (!found) {
        noResultsMessage = document.createElement("p");
        noResultsMessage.id = "noResultsMessage";
        noResultsMessage.innerText = "ไม่พบข่าวที่ค้นหา";
        noResultsMessage.style.textAlign = "center";
        noResultsMessage.style.color = "red";
        document.getElementById("news-container").appendChild(noResultsMessage);
    }
}

// ฟังก์ชันการกดปุ่มเลือกหมวดหมู่
function loadNews(category, isNotification = false) {
    let container = isNotification ? document.getElementById('news-container-noti') : document.getElementById('news-container');
    let fbContainer = isNotification ? document.getElementById('facebook-container-noti') : document.getElementById('facebook-container');

    let categoryTabs = isNotification ? document.querySelectorAll("#categoryTabsNoti .nav-link") : document.querySelectorAll("#categoryTabs .nav-link");
    
    categoryTabs.forEach(btn => {
        btn.classList.remove("active");
    });
    
    categoryTabs.forEach(btn => {
        if (btn.getAttribute("onclick").includes(category)) {
            btn.classList.add("active");
        }
    });
    
    if (category === "news") {
        container.style.display = "block";
        fbContainer.style.display = "none";
        fetchNewsData(container, category, isNotification);
    } else {
        container.style.display = "none";
        fbContainer.style.display = "block";
        loadFacebook(isNotification); // เพิ่มโหลด Facebook
    }
}

function loadFacebook(isNotification = false) {
    let fbContainer = isNotification ? document.getElementById('facebook-container-noti') : document.getElementById('facebook-container');
    let newsContainer = isNotification ? document.getElementById('news-container-noti') : document.getElementById('news-container');

    fbContainer.style.display = "block";
    newsContainer.style.display = "none";

    let categoryTabs = isNotification ? document.querySelectorAll("#categoryTabsNoti .nav-link") : document.querySelectorAll("#categoryTabs .nav-link");
    categoryTabs.forEach(btn => {
        if (btn.getAttribute("onclick").includes("Facebook")) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // โหลด Facebook Plugin ใหม่ (กรณีที่ไม่โหลดอัตโนมัติ)
    if (typeof FB !== 'undefined') {
        FB.XFBML.parse();
    }
}

// ฟังก์ชันข่าว
function fetchNewsData(container, category, isNotification = false) {
    fetch(`/fetch_news.php?category=${category}`)
        .then(response => response.json())
        .then(data => {
            console.log("Data received:", data);
            container.innerHTML = '';
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>ไม่มีข่าวในขณะนี้</p>';
                return;
            }
            
            let rowDiv = null;
            data.forEach((news, index) => {
                const picture = news.ns_picture ? news.ns_picture : '/image/image_b.png';
                
                let newsHTML = isNotification ? `
                    <div class="news-item-noti" onclick='openNewsModal(${JSON.stringify(news)})'>
                        <img src="${picture}" alt="${news.ns_head}">
                        <div class="news-title">
                            <div class="news-date-noti">
                                <i class="fas fa-clock"></i> ${new Date(news.ns_date).toLocaleDateString()}
                            </div>
                            <h3 class="news-head-noti">${news.ns_head}</h3>
                            <div class="news-details">
                                <span class="news-category-noti">${news.nsg_name}</span>
                            </div>
                        </div>
                    </div>
                ` : `
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
                    </div>
                `;

                if (!isNotification) {
                    if (index % 3 === 0) {
                        rowDiv = document.createElement("div");
                        rowDiv.classList.add("news-row");
                        container.appendChild(rowDiv);
                    }
                    rowDiv.innerHTML += newsHTML;
                } else {
                    container.innerHTML += newsHTML;
                }
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            container.innerHTML = `<p style="color: red;">ไม่สามารถโหลดข่าวได้ (${error.message})</p>`;
        });
}

// ฟังก์ชัน Popup
function openNewsModal(news) {
    document.getElementById("modalTitle").innerText = news.ns_head;
    document.getElementById("modalImage").src = news.ns_picture ? news.ns_picture : "/image/image_b.png";
    document.getElementById("modalBody").innerText = news.ns_body;
    document.getElementById("modalCategory").innerText = `ที่มา: ${news.nsg_name}`;
    document.getElementById("modalDate").innerHTML = `<i class="fas fa-clock"></i> ${new Date(news.ns_date).toLocaleDateString()}`;
    
    document.getElementById("newsModal").style.display = "flex";
}

if (document.querySelector(".close")) {
    document.querySelector(".close").addEventListener("click", function() {
        document.getElementById("newsModal").style.display = "none";
    });
}