// Массив всех блюд (будет заполнен через API)
let dishes = [];

// API URL и ключ
// Прямое подключение к API (CORS поддерживается)
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
if (typeof window.API_KEY === 'undefined' && typeof API_KEY === 'undefined') {
    window.API_KEY = '4e072be6-7310-4570-a60f-f310f62ad707';
    var API_KEY = window.API_KEY;
} else if (typeof window.API_KEY !== 'undefined') {
    var API_KEY = window.API_KEY;
}

// Функция для загрузки блюд через API
async function loadDishes() {
    try {
        console.log('Начинаем загрузку блюд...');
        const apiKey = window.API_KEY || API_KEY;
        const response = await fetch(`${API_URL}?api_key=${apiKey}`, {
            method: 'GET',
            mode: 'cors'
        });

        console.log('Ответ получен, статус:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка ответа:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Данные получены, количество блюд:', data.length);
        
        // Нормализуем категории (API возвращает main-course и salad, а нам нужны main и starter)
        dishes = data.map(dish => {
            const normalizedDish = { ...dish };
            if (dish.category === 'main-course') {
                normalizedDish.category = 'main';
            } else if (dish.category === 'salad') {
                normalizedDish.category = 'starter';
            }
            // Изображения уже приходят с полными URL из API
            return normalizedDish;
        });
        
        console.log('Блюда загружены и нормализованы:', dishes.length);
        
        // Вызываем функцию отображения блюд после загрузки
        setTimeout(() => {
            if (typeof displayDishes === 'function') {
                displayDishes();
            }
            
            // Восстанавливаем выделение после загрузки
            if (typeof restoreSelection === 'function') {
                setTimeout(restoreSelection, 200);
            }
            
            // Инициализируем фильтры после загрузки
            if (typeof initFilters === 'function') {
                setTimeout(initFilters, 200);
            }
        }, 100);
        
        return dishes;
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
        console.error('Детали ошибки:', error.message);
        
        // Проверяем тип ошибки
        let errorMessage = 'Ошибка при загрузке меню.';
        let errorDetails = error.message || 'Неизвестная ошибка';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
            errorMessage = 'Не удалось подключиться к серверу.';
            errorDetails = 'Проверьте интернет-соединение и доступность API сервера.';
        } else if (error.message.includes('HTTP error')) {
            errorMessage = 'Ошибка сервера при загрузке меню.';
        }
        
        // Показываем сообщение об ошибке только один раз
        if (document.body && !document.getElementById('dishes-error-shown')) {
            const errorFlag = document.createElement('div');
            errorFlag.id = 'dishes-error-shown';
            errorFlag.style.display = 'none';
            document.body.appendChild(errorFlag);
            
            // Удаляем существующее уведомление, если есть
            const existing = document.getElementById('error-notification');
            if (existing) existing.remove();
            
            const errorMsg = document.createElement('div');
            errorMsg.id = 'error-notification';
            errorMsg.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;';
            errorMsg.innerHTML = `
                <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px;">
                    <p style="font-size: 18px; margin-bottom: 15px; color: #2c2c2c; font-weight: 600;">${errorMessage}</p>
                    <p style="font-size: 14px; margin-bottom: 25px; color: #666;">${errorDetails}</p>
                    <button id="close-error-btn" style="padding: 12px 30px; background: #8B4513; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">Закрыть</button>
                </div>
            `;
            document.body.appendChild(errorMsg);
            
            // Добавляем обработчик для кнопки
            const closeBtn = errorMsg.querySelector('#close-error-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    errorMsg.remove();
                    // Не перезагружаем страницу автоматически, даем пользователю возможность запустить сервер
                });
            }
        }
        return [];
    }
}
