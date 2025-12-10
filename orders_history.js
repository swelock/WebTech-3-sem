// API URL и ключ
// Прямое подключение к API (CORS поддерживается)
const API_ORDERS_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';
if (typeof window.API_KEY === 'undefined' && typeof API_KEY === 'undefined') {
    window.API_KEY = '4e072be6-7310-4570-a60f-f310f62ad707';
    var API_KEY = window.API_KEY;
} else if (typeof window.API_KEY !== 'undefined') {
    var API_KEY = window.API_KEY;
}

// Переменная для хранения текущего заказа для редактирования/удаления
let currentOrderId = null;

// Переменная dishes объявлена глобально в dishes.js

// Функция для загрузки заказов с сервера
async function loadOrders() {
    try {
        // Получаем API_KEY из window или локальной переменной
        const apiKey = window.API_KEY || API_KEY;
        if (!apiKey) {
            throw new Error('API ключ не найден');
        }
        
        console.log('Загрузка заказов с API:', `${API_ORDERS_URL}?api_key=${apiKey}`);
        
        // Добавляем timestamp для предотвращения кэширования
        const url = `${API_ORDERS_URL}?api_key=${apiKey}&_t=${Date.now()}`;
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store'
        });

        console.log('Ответ от API заказов:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
            console.error('Ошибка ответа API:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        console.log('Получено заказов:', Array.isArray(orders) ? orders.length : 'не массив');
        console.log('Заказы:', orders);
        
        // Проверяем, что orders - это массив
        if (!Array.isArray(orders)) {
            console.error('API вернул не массив:', orders);
            throw new Error('Неверный формат данных от сервера');
        }
        
        // Сортируем по дате оформления (новые сначала)
        orders.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });

        displayOrders(orders);
        return orders;
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        
        // Более понятное сообщение об ошибке
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
            errorMessage = 'Не удалось подключиться к серверу API. Проверьте интернет-соединение.';
        } else if (error.message.includes('API ключ')) {
            errorMessage = 'Ошибка авторизации API. Проверьте API ключ.';
        }
        
        showNotification('Ошибка при загрузке заказов: ' + errorMessage, 'error');
        const loadingEl = document.getElementById('orders-loading');
        if (loadingEl) {
            loadingEl.textContent = 'Ошибка загрузки заказов: ' + errorMessage;
        }
        return [];
    }
}

// Функция для получения названий блюд по ID
async function getDishNames(order) {
    // Загружаем блюда, если еще не загружены
    if (!dishes || dishes.length === 0) {
        if (typeof loadDishes === 'function') {
            await loadDishes();
        }
    }

    const dishNames = [];
    const categoryNames = {
        soup_id: 'Суп',
        main_course_id: 'Главное блюдо',
        salad_id: 'Салат/стартер',
        drink_id: 'Напиток',
        dessert_id: 'Десерт'
    };

    if (order.soup_id && dishes) {
        const dish = dishes.find(d => d.id === order.soup_id);
        if (dish) dishNames.push(dish.name);
    }
    if (order.main_course_id && dishes) {
        const dish = dishes.find(d => d.id === order.main_course_id);
        if (dish) dishNames.push(dish.name);
    }
    if (order.salad_id && dishes) {
        const dish = dishes.find(d => d.id === order.salad_id);
        if (dish) dishNames.push(dish.name);
    }
    if (order.drink_id && dishes) {
        const dish = dishes.find(d => d.id === order.drink_id);
        if (dish) dishNames.push(dish.name);
    }
    if (order.dessert_id && dishes) {
        const dish = dishes.find(d => d.id === order.dessert_id);
        if (dish) dishNames.push(dish.name);
    }

    return dishNames.join(', ');
}

// Функция для расчета стоимости заказа
async function calculateOrderTotal(order) {
    if (!dishes || dishes.length === 0) {
        if (typeof loadDishes === 'function') {
            await loadDishes();
        }
    }

    let total = 0;
    if (order.soup_id && dishes) {
        const dish = dishes.find(d => d.id === order.soup_id);
        if (dish) total += dish.price;
    }
    if (order.main_course_id && dishes) {
        const dish = dishes.find(d => d.id === order.main_course_id);
        if (dish) total += dish.price;
    }
    if (order.salad_id && dishes) {
        const dish = dishes.find(d => d.id === order.salad_id);
        if (dish) total += dish.price;
    }
    if (order.drink_id && dishes) {
        const dish = dishes.find(d => d.id === order.drink_id);
        if (dish) total += dish.price;
    }
    if (order.dessert_id && dishes) {
        const dish = dishes.find(d => d.id === order.dessert_id);
        if (dish) total += dish.price;
    }

    return total;
}

// Функция для форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Функция для форматирования времени доставки
function formatDeliveryTime(order) {
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        const [hours, minutes] = order.delivery_time.split(':');
        return `${hours}:${minutes}`;
    }
    return 'Как можно скорее (с 7:00 до 23:00)';
}

// Функция для отображения заказов в таблице
async function displayOrders(orders) {
    console.log('displayOrders вызвана с заказами:', orders);
    const tbody = document.getElementById('orders-tbody');
    const loading = document.getElementById('orders-loading');
    const empty = document.getElementById('orders-empty');
    const table = document.getElementById('orders-table');

    if (!tbody) return;

    loading.style.display = 'none';

    if (orders.length === 0) {
        console.log('Заказы отсутствуют, показываем сообщение');
        empty.style.display = 'block';
        table.style.display = 'none';
        return;
    }
    
    console.log('Отображаем', orders.length, 'заказов');

    empty.style.display = 'none';
    table.style.display = 'table';
    tbody.innerHTML = '';

    // Загружаем блюда для получения названий
    if (!dishes || dishes.length === 0) {
        if (typeof loadDishes === 'function') {
            await loadDishes();
        }
    }

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const row = document.createElement('tr');
        
        const dishNames = await getDishNames(order);
        const total = await calculateOrderTotal(order);
        const deliveryTime = formatDeliveryTime(order);
        const formattedDate = formatDate(order.created_at);

        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${formattedDate}</td>
            <td>${dishNames || 'Нет блюд'}</td>
            <td>${total}₽</td>
            <td>${deliveryTime}</td>
            <td class="actions-cell">
                <button class="action-btn view" onclick="viewOrder(${order.id})" title="Подробнее">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editOrder(${order.id})" title="Редактирование">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete" onclick="deleteOrder(${order.id})" title="Удаление">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    }
}

// Функция для открытия модального окна просмотра заказа
async function viewOrder(orderId) {
    try {
        const apiKey = window.API_KEY || API_KEY;
        const response = await fetch(`${API_ORDERS_URL}/${orderId}?api_key=${apiKey}`, {
            method: 'GET',
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказа');
        }

        const order = await response.json();
        
        // Загружаем блюда для получения названий
        if (!dishes || dishes.length === 0) {
            if (typeof loadDishes === 'function') {
                await loadDishes();
            }
        }

        const modalBody = document.getElementById('view-modal-body');
        const total = await calculateOrderTotal(order);
        const deliveryTime = formatDeliveryTime(order);

        let dishesHTML = '';
        if (order.soup_id && dishes) {
            const dish = dishes.find(d => d.id === order.soup_id);
            if (dish) dishesHTML += `<p><strong>Суп:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.main_course_id && dishes) {
            const dish = dishes.find(d => d.id === order.main_course_id);
            if (dish) dishesHTML += `<p><strong>Основное блюдо:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.salad_id && dishes) {
            const dish = dishes.find(d => d.id === order.salad_id);
            if (dish) dishesHTML += `<p><strong>Салат/стартер:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.drink_id && dishes) {
            const dish = dishes.find(d => d.id === order.drink_id);
            if (dish) dishesHTML += `<p><strong>Напиток:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.dessert_id && dishes) {
            const dish = dishes.find(d => d.id === order.dessert_id);
            if (dish) dishesHTML += `<p><strong>Десерт:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }

        modalBody.innerHTML = `
            <div class="modal-info-group">
                <label>Дата оформления</label>
                <div class="value">${formatDate(order.created_at)}</div>
            </div>
            <div class="modal-info-group">
                <label>Доставка</label>
                <div class="value">
                    <p><strong>Имя получателя:</strong> ${order.full_name}</p>
                    <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                    <p><strong>Время доставки:</strong> ${deliveryTime}</p>
                    <p><strong>Телефон:</strong> ${order.phone}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                </div>
            </div>
            ${order.comment ? `
            <div class="modal-info-group">
                <label>Комментарий</label>
                <div class="value">${order.comment}</div>
            </div>
            ` : ''}
            <div class="modal-info-group">
                <label>Состав заказа</label>
                <div class="value">
                    ${dishesHTML || '<p>Нет блюд</p>'}
                </div>
            </div>
            <div class="modal-info-group">
                <label>Стоимость:</label>
                <div class="value" style="font-size: 20px; font-weight: 700; color: #8B4513;">${total}₽</div>
            </div>
        `;

        document.getElementById('view-modal').style.display = 'flex';
    } catch (error) {
        console.error('Ошибка при загрузке заказа:', error);
        showNotification('Ошибка при загрузке заказа: ' + error.message, 'error');
    }
}

// Функция для открытия модального окна редактирования заказа
async function editOrder(orderId) {
    currentOrderId = orderId;
    
    try {
        const apiKey = window.API_KEY || API_KEY;
        const response = await fetch(`${API_ORDERS_URL}/${orderId}?api_key=${apiKey}`, {
            method: 'GET',
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказа');
        }

        const order = await response.json();
        
        // Загружаем блюда для получения названий
        if (!dishes || dishes.length === 0) {
            if (typeof loadDishes === 'function') {
                await loadDishes();
            }
        }

        const modalBody = document.getElementById('edit-modal-body');
        const total = await calculateOrderTotal(order);

        let dishesHTML = '';
        if (order.soup_id && dishes) {
            const dish = dishes.find(d => d.id === order.soup_id);
            if (dish) dishesHTML += `<p><strong>Суп:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.main_course_id && dishes) {
            const dish = dishes.find(d => d.id === order.main_course_id);
            if (dish) dishesHTML += `<p><strong>Основное блюдо:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.salad_id && dishes) {
            const dish = dishes.find(d => d.id === order.salad_id);
            if (dish) dishesHTML += `<p><strong>Салат/стартер:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.drink_id && dishes) {
            const dish = dishes.find(d => d.id === order.drink_id);
            if (dish) dishesHTML += `<p><strong>Напиток:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }
        if (order.dessert_id && dishes) {
            const dish = dishes.find(d => d.id === order.dessert_id);
            if (dish) dishesHTML += `<p><strong>Десерт:</strong> ${dish.name} (${dish.price}₽)</p>`;
        }

        // Форматируем время для input type="time"
        let deliveryTimeValue = '';
        if (order.delivery_time) {
            deliveryTimeValue = order.delivery_time;
        }

        modalBody.innerHTML = `
            <div class="modal-info-group">
                <label>Дата оформления</label>
                <div class="value readonly" style="padding: 10px 12px; background-color: #f5f5f5; border-radius: 8px;">${formatDate(order.created_at)}</div>
            </div>
            <div class="modal-info-group">
                <label>Доставка</label>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Имя получателя</label>
                        <input type="text" name="full_name" value="${order.full_name}" required>
                    </div>
                    <div>
                        <label style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Адрес доставки</label>
                        <input type="text" name="delivery_address" value="${order.delivery_address}" required>
                    </div>
                    <div>
                        <label style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Тип доставки</label>
                        <div class="radio-group-modal">
                            <label class="radio-label-modal">
                                <input type="radio" name="delivery_type" value="now" ${order.delivery_type === 'now' ? 'checked' : ''}>
                                <span>Как можно скорее</span>
                            </label>
                            <label class="radio-label-modal">
                                <input type="radio" name="delivery_type" value="by_time" ${order.delivery_type === 'by_time' ? 'checked' : ''}>
                                <span>Ко времени</span>
                            </label>
                        </div>
                    </div>
                    <div id="edit-time-group" style="${order.delivery_type === 'by_time' ? '' : 'display: none;'}">
                        <label style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Время доставки</label>
                        <input type="time" name="delivery_time" value="${deliveryTimeValue}" min="07:00" max="23:00" step="300">
                    </div>
                    <div>
                        <label style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Телефон</label>
                        <input type="tel" name="phone" value="${order.phone}" required>
                    </div>
                    <div>
                        <label style="font-size: 14px; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Email</label>
                        <input type="email" name="email" value="${order.email}" required>
                    </div>
                </div>
            </div>
            <div class="modal-info-group">
                <label>Комментарий</label>
                <textarea name="comment">${order.comment || ''}</textarea>
            </div>
            <div class="modal-info-group">
                <label>Состав заказа</label>
                <div class="value">
                    ${dishesHTML || '<p>Нет блюд</p>'}
                </div>
            </div>
            <div class="modal-info-group">
                <label>Стоимость:</label>
                <div class="value" style="font-size: 20px; font-weight: 700; color: #8B4513;">${total}₽</div>
            </div>
        `;

        // Обработчик изменения типа доставки
        const deliveryTypeInputs = modalBody.querySelectorAll('input[name="delivery_type"]');
        deliveryTypeInputs.forEach(input => {
            input.addEventListener('change', function() {
                const timeGroup = document.getElementById('edit-time-group');
                if (this.value === 'by_time') {
                    timeGroup.style.display = 'block';
                    timeGroup.querySelector('input[name="delivery_time"]').required = true;
                } else {
                    timeGroup.style.display = 'none';
                    timeGroup.querySelector('input[name="delivery_time"]').required = false;
                }
            });
        });

        document.getElementById('edit-modal').style.display = 'flex';
    } catch (error) {
        console.error('Ошибка при загрузке заказа:', error);
        showNotification('Ошибка при загрузке заказа: ' + error.message, 'error');
    }
}

// Функция для открытия модального окна удаления заказа
function deleteOrder(orderId) {
    currentOrderId = orderId;
    document.getElementById('delete-modal').style.display = 'flex';
}

// Функция для подтверждения удаления заказа
async function confirmDelete() {
    if (!currentOrderId) return;

    try {
        const apiKey = window.API_KEY || API_KEY;
        const response = await fetch(`${API_ORDERS_URL}/${currentOrderId}?api_key=${apiKey}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        closeModal('delete-modal');
        showNotification('Заказ успешно удалён', 'success');
        
        // Обновляем список заказов
        await loadOrders();
        currentOrderId = null;
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        showNotification('Ошибка при удалении заказа: ' + error.message, 'error');
    }
}

// Функция для закрытия модального окна
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'edit-modal' || modalId === 'delete-modal') {
        currentOrderId = null;
    }
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Удаляем существующее уведомление
    const existing = document.getElementById('notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 25px; background: ' + 
        (type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#8B4513') + 
        '; color: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10001; font-family: "Open Sans", sans-serif; font-size: 16px; max-width: 400px;';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Обработчик отправки формы редактирования
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('edit-order-form');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!currentOrderId) return;

            const formData = new FormData(this);
            const orderData = {
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                delivery_address: formData.get('delivery_address'),
                delivery_type: formData.get('delivery_type'),
                delivery_time: formData.get('delivery_time') || null,
                comment: formData.get('comment') || ''
            };

            // Удаляем delivery_time, если тип доставки "now"
            if (orderData.delivery_type === 'now') {
                delete orderData.delivery_time;
            }

            // Проверяем время доставки, если delivery_type = by_time
            if (orderData.delivery_type === 'by_time' && !orderData.delivery_time) {
                showNotification('Укажите время доставки', 'error');
                return;
            }

            try {
                const apiKey = window.API_KEY || API_KEY;
                const response = await fetch(`${API_ORDERS_URL}/${currentOrderId}?api_key=${apiKey}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                closeModal('edit-modal');
                showNotification('Заказ успешно изменён', 'success');
                
                // Обновляем список заказов
                await loadOrders();
                currentOrderId = null;
            } catch (error) {
                console.error('Ошибка при редактировании заказа:', error);
                showNotification('Ошибка при редактировании заказа: ' + error.message, 'error');
            }
        });
    }

    // Закрытие модальных окон при клике вне их
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Загружаем блюда и заказы при загрузке страницы
    // Небольшая задержка для гарантии, что все скрипты загружены
    setTimeout(async () => {
        console.log('=== НАЧАЛО ЗАГРУЗКИ СТРАНИЦЫ ЗАКАЗОВ ===');
        console.log('loadDishes доступна?', typeof loadDishes === 'function');
        console.log('dishes до загрузки:', dishes);
        
        // Сначала загружаем блюда
        if (typeof loadDishes === 'function') {
            try {
                console.log('Вызываем loadDishes...');
                await loadDishes();
                console.log('Блюда загружены для страницы заказов:', dishes ? dishes.length : 0);
            } catch (error) {
                console.error('Ошибка загрузки блюд:', error);
            }
        } else {
            console.error('Функция loadDishes не найдена!');
        }
        
        // Потом загружаем заказы
        console.log('Вызываем loadOrders...');
        await loadOrders();
        console.log('=== ЗАГРУЗКА ЗАВЕРШЕНА ===');
    }, 100);
    
    // Если есть параметр refresh, перезагружаем заказы
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('refresh')) {
        console.log('Обнаружен параметр refresh, будет выполнена перезагрузка заказов');
        const orderId = urlParams.get('orderId');
        
        // Сразу загружаем заказы
        loadOrders().then((orders) => {
            console.log('Первая загрузка заказов после создания нового заказа, получено заказов:', orders ? orders.length : 0);
            if (orderId && orders) {
                const foundOrder = orders.find(o => o.id == orderId);
                if (foundOrder) {
                    console.log('Новый заказ найден в списке!');
                } else {
                    console.log('Новый заказ еще не появился, повторная попытка через 1 секунду...');
                    setTimeout(() => loadOrders(), 1000);
                }
            }
        }).catch(err => {
            console.error('Ошибка при первой загрузке заказов:', err);
        });
        
        // Повторная загрузка через 1.5 секунды для гарантии
        setTimeout(() => {
            console.log('Перезагрузка заказов после создания нового заказа...');
            loadOrders().then((orders) => {
                console.log('Заказы перезагружены, получено заказов:', orders ? orders.length : 0);
            }).catch(err => {
                console.error('Ошибка при перезагрузке заказов:', err);
            });
        }, 1500);
        
        // Еще одна попытка через 3 секунды
        setTimeout(() => {
            console.log('Финальная загрузка заказов...');
            loadOrders().then((orders) => {
                console.log('Финальная загрузка заказов завершена, получено заказов:', orders ? orders.length : 0);
            }).catch(err => {
                console.error('Ошибка при финальной загрузке заказов:', err);
            });
        }, 3000);
    }
    
    // Также периодически проверяем новые заказы, если страница открыта
    let ordersCheckInterval = setInterval(function() {
        // Перезагружаем заказы каждые 3 секунды, если страница видима
        if (!document.hidden) {
            loadOrders();
        }
    }, 3000);
    
    // Останавливаем интервал при скрытии страницы
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearInterval(ordersCheckInterval);
        } else {
            ordersCheckInterval = setInterval(function() {
                if (!document.hidden) {
                    loadOrders();
                }
            }, 3000);
        }
    });
});

