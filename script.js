const STORAGE_KEYS = {
    users: 'korochki_users',
    applications: 'korochki_applications',
    currentUser: 'korochki_current_user'
};

const db = {
    getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'),
    setUsers: (users) => localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)),
    getApps: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.applications) || '[]'),
    setApps: (apps) => localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(apps)),
    getCurrentUser: () => localStorage.getItem(STORAGE_KEYS.currentUser),
    setCurrentUser: (login) => {
        if (login) localStorage.setItem(STORAGE_KEYS.currentUser, login);
        else localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
};

function initTestData() {
    const users = db.getUsers();
    if (users.length === 0) {
        db.setUsers([
            {
                login: 'user123',
                password: '123456',
                fullName: 'Иван Петров',
                phone: '8(999)123-45-67',
                email: 'ivan@test.ru'
            },
            {
                login: 'Admin',
                password: 'KorokNET',
                fullName: 'Администратор',
                phone: '8(999)000-00-00',
                email: 'admin@test.ru'
            }
        ]);
    }

    const apps = db.getApps();
    if (apps.length === 0) {
        db.setApps([
            {
                id: '1',
                userId: 'user123',
                courseName: 'Веб-разработка на React',
                startDate: '2026-07-15',
                paymentMethod: 'transfer',
                status: 'Новая',
                review: ''
            },
            {
                id: '2',
                userId: 'user123',
                courseName: 'Python для анализа данных',
                startDate: '2026-08-01',
                paymentMethod: 'cash',
                status: 'Идет обучение',
                review: 'Отличный курс!'
            },
            {
                id: '3',
                userId: 'user123',
                courseName: 'DevOps практика',
                startDate: '2026-06-01',
                paymentMethod: 'transfer',
                status: 'Обучение завершено',
                review: 'Очень понравилось'
            }
        ]);
    }
}

initTestData();

function getCurrentUser() {
    return db.getCurrentUser();
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function checkAuth() {
    if (!getCurrentUser()) {
        redirectToLogin();
        return false;
    }
    return true;
}

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const errorDiv = document.getElementById('registerError');

        errorDiv.classList.add('d-none');

        // Валидация
        if (!/^[a-zA-Z0-9]{6,}$/.test(login)) {
            showError(errorDiv, 'Логин должен содержать только латиницу и цифры, минимум 6 символов');
            return;
        }

        if (password.length < 8) {
            showError(errorDiv, 'Пароль должен быть не менее 8 символов');
            return;
        }

        if (password !== confirmPassword) {
            showError(errorDiv, 'Пароли не совпадают');
            return;
        }

        if (!/^[А-Яа-яЁё\s]+$/.test(fullName)) {
            showError(errorDiv, 'ФИО должно содержать только кириллицу и пробелы');
            return;
        }

        if (!/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone)) {
            showError(errorDiv, 'Формат телефона: 8(XXX)XXX-XX-XX');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError(errorDiv, 'Некорректный email');
            return;
        }

        const users = db.getUsers();
        if (users.find(u => u.login === login)) {
            showError(errorDiv, 'Пользователь с таким логином уже существует');
            return;
        }

        users.push({ login, password, fullName, phone, email });
        db.setUsers(users);

        alert('Регистрация успешна! Теперь войдите.');
        window.location.href = 'login.html';
    });
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('d-none');
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        errorDiv.classList.add('d-none');

        const users = db.getUsers();
        const user = users.find(u => u.login === login && u.password === password);

        if (user) {
            db.setCurrentUser(login);
            
            if (login === 'Admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'applications.html';
            }
        } else {
            showError(errorDiv, 'Неверный логин или пароль');
        }
    });
}

if (document.getElementById('applicationsList')) {
    if (!checkAuth()) {
        
    }

    const currentUser = getCurrentUser();
    const apps = db.getApps().filter(a => a.userId === currentUser);
    const container = document.getElementById('applicationsList');
    const noApps = document.getElementById('noApplications');

    if (apps.length === 0) {
        noApps.classList.remove('d-none');
    } else {
        apps.forEach(app => {
            const card = document.createElement('div');
            card.className = 'card mb-3';
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${app.courseName}</h5>
                    <p class="card-text">
                        <strong>Дата начала:</strong> ${app.startDate}<br>
                        <strong>Способ оплаты:</strong> ${app.paymentMethod === 'cash' ? 'Наличные' : 'Перевод по номеру телефона'}<br>
                        <strong>Статус:</strong> <span class="badge ${getStatusBadge(app.status)}">${app.status}</span>
                    </p>
                    ${app.review ? `<p><strong>Отзыв:</strong> ${app.review}</p>` : ''}
                    <div class="mt-2">
                        <input type="text" class="form-control mb-2" id="review_${app.id}" placeholder="Оставить отзыв..." value="${app.review || ''}">
                        <button class="btn btn-primary btn-sm" onclick="submitReview('${app.id}')">Отправить отзыв</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

function getStatusBadge(status) {
    const map = {
        'Новая': 'bg-primary',
        'Идет обучение': 'bg-warning',
        'Обучение завершено': 'bg-success'
    };
    return map[status] || 'bg-secondary';
}

function submitReview(appId) {
    const reviewInput = document.getElementById(`review_${appId}`);
    if (!reviewInput) return;

    const review = reviewInput.value.trim();
    const apps = db.getApps();
    const updated = apps.map(a => 
        a.id === appId ? { ...a, review } : a
    );
    db.setApps(updated);
    alert('Отзыв сохранен!');
    location.reload();
}

if (document.getElementById('newApplicationForm')) {
    if (!checkAuth()) {
        
    }

    document.getElementById('newApplicationForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const courseName = document.getElementById('courseName').value.trim();
        const startDate = document.getElementById('startDate').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const currentUser = getCurrentUser();

        if (!courseName || !startDate) {
            alert('Заполните все поля');
            return;
        }

        const apps = db.getApps();
        const newApp = {
            id: Date.now().toString(),
            userId: currentUser,
            courseName,
            startDate,
            paymentMethod,
            status: 'Новая',
            review: ''
        };

        apps.push(newApp);
        db.setApps(apps);

        alert('Заявка отправлена!');
        window.location.href = 'applications.html';
    });
}

if (document.getElementById('adminTableBody')) {
    const currentUser = getCurrentUser();
    const errorDiv = document.getElementById('adminError');
    const contentDiv = document.getElementById('adminContent');

    if (currentUser !== 'Admin') {
        errorDiv.classList.remove('d-none');
        errorDiv.textContent = 'Доступ только для администратора. Войдите как Admin.';
        document.querySelector('.table-responsive')?.classList.add('d-none');
    } else {
        errorDiv.classList.add('d-none');
        contentDiv.classList.remove('d-none');
        renderAdminTable();
    }
}

function renderAdminTable() {
    const apps = db.getApps();
    const users = db.getUsers();
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';

    apps.forEach(app => {
        const user = users.find(u => u.login === app.userId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.id}</td>
            <td>${user ? user.fullName : app.userId}</td>
            <td>${app.courseName}</td>
            <td>${app.startDate}</td>
            <td>${app.paymentMethod === 'cash' ? 'Наличные' : 'Перевод'}</td>
            <td><span class="badge ${getStatusBadge(app.status)}">${app.status}</span></td>
            <td>${app.review || '-'}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="changeStatus('${app.id}', 'Идет обучение')">В обучение</button>
                <button class="btn btn-success btn-sm" onclick="changeStatus('${app.id}', 'Обучение завершено')">Завершить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function changeStatus(appId, newStatus) {
    const apps = db.getApps();
    const updated = apps.map(a => 
        a.id === appId ? { ...a, status: newStatus } : a
    );
    db.setApps(updated);
    renderAdminTable();
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            db.setCurrentUser(null);
            window.location.href = 'login.html';
        });
    }

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            db.setCurrentUser(null);
            window.location.href = 'login.html';
        });
    }

    const protectedPages = ['applications.html', 'new-application.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage)) {
        if (!getCurrentUser()) {
            window.location.href = 'login.html';
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var track = document.getElementById('sliderTrack');
    var prevBtn = document.getElementById('sliderPrev');
    var nextBtn = document.getElementById('sliderNext');
    var dots = document.querySelectorAll('.dot');
    
    if (!track) return;

    var currentIndex = 0;
    var totalSlides = dots.length;
    var autoplayInterval;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentIndex = index;
        track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
        
        dots.forEach(function(dot, i) {
            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            prevSlide();
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            nextSlide();
            startAutoplay();
        });
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            goToSlide(index);
            startAutoplay();
        });
    });

    var sliderContainer = document.getElementById('mainSlider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoplay);
        sliderContainer.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
});