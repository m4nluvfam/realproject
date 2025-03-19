document.addEventListener("DOMContentLoaded", function () {
    handleResponsiveUI(); 
    setupListeners();     
    checkLoginStatus();
    setupFacebookTabsForNoti();   
});

window.addEventListener("resize", handleResponsiveUI);

// ✅ ตรวจสอบขนาดหน้าจอ
function handleResponsiveUI() {
    const width = window.innerWidth;
    const fullUI = document.getElementById('fullUI');
    const notificationUI = document.getElementById('notificationUI');

    if (width <= 500) {
        fullUI.style.display = 'none';
        notificationUI.style.display = 'block';
        loadNews('news', true); 
    } else {
        fullUI.style.display = 'block';
        notificationUI.style.display = 'none';
        loadNews('news', false); 
    }
}

// ✅ Event Listeners
function setupListeners() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", filterNews);
    }

    const searchToggle = document.getElementById("search-toggle");
    if (searchToggle) {
        searchToggle.addEventListener("click", function () {
            document.getElementById('search-box-wrapper').classList.toggle('d-none');
        });
    }

    const tabs = document.querySelectorAll("#categoryTabsNoti .nav-link");
    tabs.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const isFacebook = btn.innerText.trim().toLowerCase() === "facebook";
            tabs.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");

            if (isFacebook) {
                document.getElementById('news-container-noti').style.display = 'none';
                document.getElementById('facebook-container-noti').style.display = 'block';

                if (typeof FB !== 'undefined') {
                    FB.XFBML.parse(document.getElementById('facebook-container-noti'));
                }
            } else {
                document.getElementById('news-container-noti').style.display = 'block';
                document.getElementById('facebook-container-noti').style.display = 'none';
                loadNews('news', true);
            }
        });
    });
}

// ✅ Facebook Page Switch (Full UI)
function switchPage(pageId) {
    document.querySelectorAll('.fb-tab-page').forEach(el => el.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const clickedButton = Array.from(document.querySelectorAll('.tab-button')).find(btn =>
        btn.getAttribute('onclick').includes(pageId)
    );
    if (clickedButton) clickedButton.classList.add('active');

    if (typeof FB !== 'undefined') {
        FB.XFBML.parse(document.getElementById(pageId));
    }
}

// ✅ ฟังก์ชันกรองข่าว
function filterNews() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let newsItems = document.querySelectorAll("#news-container .news-item, #news-container-noti .news-item-noti");
    let noResultsMessage = document.getElementById("noResultsMessage");
    let found = false;

    if (noResultsMessage) noResultsMessage.remove();

    newsItems.forEach(item => {
        let title = item.querySelector("h3").innerText.toLowerCase();
        let categoryEl = item.querySelector(".news-category, .news-category-noti");
        let category = categoryEl ? categoryEl.innerText.toLowerCase() : '';

        if (title.includes(query) || category.includes(query)) {
            item.style.display = "block";
            found = true;
        } else {
            item.style.display = "none";
        }
    });

    if (!found) {
        noResultsMessage = document.createElement("p");
        noResultsMessage.id = "noResultsMessage";
        noResultsMessage.innerText = "ไม่พบข่าวที่ค้นหา";
        noResultsMessage.style.textAlign = "center";
        noResultsMessage.style.color = "red";
        document.getElementById("news-container").appendChild(noResultsMessage);
    }
}

// ✅ โหลดข่าว
function loadNews(category, isNotification = false) {
    let container = isNotification ? document.getElementById('news-container-noti') : document.getElementById('newsArea');
    container.innerHTML = '';

    fetch(`/fetch_news.php?category=${category}`)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>ไม่มีข่าวในขณะนี้</p>';
                return;
            }

            if (isNotification) {
                data.forEach(news => container.innerHTML += buildNewsItemNoti(news));
                setupExpandableNews(); 
            } else {
                let rowDiv = null;
                data.forEach((news, index) => {
                    if (index % 2 === 0) {
                        rowDiv = document.createElement("div");
                        rowDiv.classList.add("news-row");
                        container.appendChild(rowDiv);
                    }
                    rowDiv.innerHTML += buildNewsItem(news);
                });
            }
        })
        .catch(err => {
            container.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาดในการโหลดข่าว: ${err.message}</p>`;
        });
}

// ✅ Full UI
function buildNewsItem(news) {
    const picture = news.ns_picture ? news.ns_picture : '/image/image_b.png';
    return `
        <div class="news-item" onclick='openNewsModal(${JSON.stringify(news)})'>
            <img src="${picture}" alt="${news.ns_head}">
            <h3 class="news-head">${news.ns_head}</h3>
            <div class="news-footer">
                <p class="news-date">
                    <i class="fas fa-clock"></i> ${new Date(news.ns_date).toLocaleDateString()}
                </p>
                <span class="news-category">${news.nsg_name}</span>
            </div>
        </div>
    `;
}

// ✅ Notification UI
function buildNewsItemNoti(news) {
    const picture = news.ns_picture ? news.ns_picture : '/image/image_b.png';
    return `
        <div class="news-item-noti expandable">
            <div class="news-summary">
                <img src="${picture}" alt="${news.ns_head}">
                <div class="news-title">
                    <div class="news-date-noti">
                        <i class="fas fa-clock"></i> ${new Date(news.ns_date).toLocaleDateString()}
                    </div>
                    <h3 class="news-head-noti">${news.ns_head} 
                        <span class="read-more-toggle">อ่านเพิ่มเติม</span>
                    </h3>
                    <div class="news-details">
                        <span class="news-category-noti">${news.nsg_name}</span>
                    </div>
                </div>
            </div>
            <div class="news-extra">
                ${news.ns_body ? formatBody(news.ns_body) : '<p>ไม่มีรายละเอียดเพิ่มเติม</p>'}
            </div>
        </div>
    `;
}

// ✅ รองรับบรรทัดใหม่ + ลิงก์
function formatBody(text) {
    return text
        .replace(/\n/g, "<br>")
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

// ✅ Modal
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

// ✅ Account
function checkLoginStatus() {
    let userLoggedIn = localStorage.getItem("userLoggedIn");
    let accountButton = document.getElementById("accountButton");

    if (accountButton) {
        if (userLoggedIn) {
            accountButton.innerHTML = `<i class="fa-solid fa-user"></i>`;
            accountButton.onclick = () => toggleAccountMenu();
        } else {
            accountButton.onclick = () => window.location.href = '/src/loginpage/login.html';
        }
    }
}

function toggleAccountMenu() {
    let existingMenu = document.getElementById("accountMenu");
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    let menu = document.createElement("div");
    menu.id = "accountMenu";
    menu.classList.add("account-menu");
    menu.innerHTML = `
        <button onclick="window.location.href='/post.html'">โพสต์ข่าว</button>
        <button onclick="logout()">ออกจากระบบ</button>
    `;
    document.body.appendChild(menu);

    let rect = document.getElementById("accountButton").getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
}

function logout() {
    localStorage.removeItem("userLoggedIn");
    window.location.reload();
}

// ✅ Expandable Read More
function setupExpandableNews() {
    const items = document.querySelectorAll(".news-item-noti.expandable");
    items.forEach(item => {
        const readMoreBtn = item.querySelector(".read-more-toggle");
        readMoreBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            const expanded = item.classList.toggle("expanded");
            readMoreBtn.innerText = expanded ? "ย่อ" : "อ่านเพิ่มเติม";
        });

        item.addEventListener("click", function () {
            if (!event.target.classList.contains('read-more-toggle')) {
                item.classList.remove("expanded");
                const toggleBtn = item.querySelector(".read-more-toggle");
                if (toggleBtn) toggleBtn.innerText = "อ่านเพิ่มเติม";
            }
        });
    });
}

function setupFacebookTabsForNoti() {
    const tabButtons = document.querySelectorAll('.fb-tab-noti');
    const pages = document.querySelectorAll('.fb-tab-page-noti');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-page');

            // เปลี่ยนปุ่ม active
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // ซ่อน/แสดงเพจ
            pages.forEach(page => page.style.display = 'none');
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.style.display = 'block';
                if (typeof FB !== 'undefined') {
                    FB.XFBML.parse(targetPage);
                }
            }
        });
    });
}
