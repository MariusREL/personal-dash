import { workouts } from "./workouts.js";

const weeklyWeatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=60.393&longitude=5.3242&daily=weather_code&current=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&forecast_hours=12&past_hours=1";

// Hourly WeatherAPI and display of daily forecast
import { weatherCodeToIcon } from "./weathercodes.js";
const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=60.39&longitude=5.32&hourly=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&forecast_days=1";

async function getDailyWeatherData() {
  let response = await fetch(weatherUrl);
  if (!response.ok) {
    console.error("error");
    return null;
  }
  let weatherData = await response.json();
  return weatherData;
}
const weatherData = await getDailyWeatherData();

console.log(weatherData);

// Destructuring weatherdata to make it easier to work with
const {
  longitude,
  latitude,
  hourly: {
    precipitation,
    time,
    temperature_2m: temperatures,
    weather_code: weatherCodes,
    wind_speed_10m: windSpeed,
    is_day: isDay,
  },
  hourly_units: {
    precipitation: rainUnits,
    temperature_2m: tempUnit,
    wind_speed_10m: windUnit,
  },
} = weatherData;

function getWeatherIcon(weatherCode) {
  return weatherCodeToIcon[weatherCode];
}

const forecasts = time.map((timestamp, i) => ({
  time: new Date(timestamp),
  windSpeed: windSpeed[i] + windUnit,
  precipitation: precipitation[i] + rainUnits,
  temperature: temperatures[i] + tempUnit,
  weatherCode: weatherCodes[i],
  isDay: Boolean(isDay[i]),
  icon: getWeatherIcon(weatherCodes[i]),
}));
console.log(forecasts);

// Filter to get only the next 8 hours from now
const now = new Date();
const futureForecasts = forecasts
  .filter((forecast) => {
    const isFuture = forecast.time > now;
    return isFuture;
  })
  .slice(0, 8);

//   generate the weathercard for the dom
const weatherContainer = document.querySelector("#weather-card-container");

const getWeatherCard = function (arr) {
  arr.forEach((forecast) => {
    const weatherCard = document.createElement("div");
    const tempElem = document.createElement("span");
    tempElem.textContent = forecast.temperature;
    const iconImg = document.createElement("img");

    const time = document.createElement("p");
    time.classList.add("time");
    time.textContent = forecast.time.getHours() + ":00";
    iconImg.style.cssText = "width: 50px; height: 50px;";
    iconImg.setAttribute("src", forecast.icon);

    const windIcon = document.createElement("img");
    windIcon.setAttribute("src", "./icons/wind.svg");
    windIcon.style.cssText =
      "width: 20px; height: 20px; vertical-align: middle; margin-left: 4px;";
    const wind = document.createElement("p");
    wind.style.cssText = "color: #4a5759; font-size: 0.6rem; margin-left: 10%";
    wind.textContent =
      Math.floor(parseFloat(forecast.windSpeed)) + " " + windUnit;
    wind.appendChild(windIcon);

    weatherCard.appendChild(time);
    weatherCard.appendChild(iconImg);
    weatherCard.appendChild(tempElem);
    weatherCard.appendChild(wind);
    weatherCard.classList.add("weather-card");
    weatherContainer.appendChild(weatherCard);
  });
};

getWeatherCard(futureForecasts);

const headerText = document.querySelector("#header-text");
const h1Header = document.createElement("h1");
h1Header.classList.add("header-h1");

const currentTemp =
  futureForecasts.length > 0
    ? Math.floor(parseFloat(futureForecasts[0].temperature))
    : Math.floor(temperatures[0]);

h1Header.innerHTML =
  `It's ${currentTemp} degrees right now, perfect conditions to go outside`.toLocaleUpperCase();
headerText.appendChild(h1Header);

const date = document.querySelector(".date");

date.textContent = now.toDateString();
