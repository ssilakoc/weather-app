const API_KEY = '3e3dccbf0700d2091cefaf3fa3061534';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherCard = document.getElementById('weather-card');


searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeatherData(city);
    }
});


cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherData(cityInput.value);
    }
});


locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=tr`;
            fetchData(url);
        });
    } else {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
    }
});


async function getWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=tr`;
    fetchData(url);
}

async function fetchData(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod === 200) {
            updateUI(data);
        
            getForecastData(data.name);
        } else {
            alert("Şehir bulunamadı.");
        }
    } catch (error) {
        console.error("Hata:", error);
    }
}

function updateUI(data) {
    const { name, main, weather, wind, dt } = data;

    document.getElementById('city-name').innerText = name;
    document.getElementById('temp').innerText = `${Math.round(main.temp)}°C`;
    document.getElementById('description').innerText = weather[0].description.toUpperCase();
    document.getElementById('humidity').innerText = `%${main.humidity}`;
    document.getElementById('wind').innerText = `${Math.round(wind.speed * 3.6)} km/s`;
    
    
    const iconCode = weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  
    const date = new Date(dt * 1000);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('date').innerText = date.toLocaleDateString('tr-TR', options);

   
    weatherCard.classList.remove('hidden');

  
    updateBackground(weather[0].main);
}


function updateBackground(status) {
    let imageUrl = "";
    stopRain(); 

    switch (status) {
        case "Clear":
            imageUrl = "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2000";
            break;
        case "Clouds":
            imageUrl = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2000";
            break;
        case "Rain":
        case "Drizzle":
        case "Thunderstorm":
            imageUrl = "https://images.unsplash.com/photo-1438449805896-28a666819a20?q=80&w=2000";
            createRain(); // Yağmuru başlat
            break;
        case "Snow":
            imageUrl = "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=2000";
            break;
        default:
            imageUrl = "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2000";
    }

    document.body.style.backgroundImage = `url('${imageUrl}')`;
}


function createRain() {
    const rainContainer = document.createElement('div');
    rainContainer.id = 'rain-container';
    document.body.appendChild(rainContainer);

    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.classList.add('drop');
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDuration = Math.random() * 0.5 + 0.5 + 's';
        drop.style.opacity = Math.random();
        rainContainer.appendChild(drop);
    }
}

function stopRain() {
    const oldRain = document.getElementById('rain-container');
    if (oldRain) {
        oldRain.remove();
    }
}

async function getForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=tr`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        updateForecastUI(data);
    } catch (error) {
        console.log("Tahmin verisi çekilemedi", error);
    }
}

function updateForecastUI(data) {
    const forecastContainer = document.getElementById('forecast');
    const forecastTitle = document.getElementById('forecast-title');
    forecastContainer.innerHTML = ''; 

    for (let i = 7; i < data.list.length; i += 8) {
        const dayData = data.list[i];
        const date = new Date(dayData.dt * 1000);
        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });

        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="ikon">
            <span>${Math.round(dayData.main.temp)}°C</span>
        `;
        forecastContainer.appendChild(card);
    }

    forecastContainer.classList.remove('hidden');
    forecastTitle.classList.remove('hidden');
}