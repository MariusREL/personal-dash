import { workouts } from "./workouts.js";

// WeatherAPI and display of daily forecast
import { weatherCodeToIcon } from "./weathercodes.js";
const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,weather_code,is_day&forecast_days=1";

const weatherContainer = document.querySelector("#weather-card-container");
console.log(weatherContainer);

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

// Destructuring weatherdata to make it easier to work with
const {
  longitude,
  latitude,
  hourly: {
    time,
    temperature_2m: temperatures,
    weather_code: weatherCodes,
    is_day: isDay,
  },
  hourly_units: { temperature_2m: tempUnit },
} = weatherData;

function getWeatherIcon(weatherCode) {
  return weatherCodeToIcon[weatherCode];
}

const forecasts = time.map((timestamp, i) => ({
  time: new Date(timestamp),
  temperature: temperatures[i] + tempUnit,
  weatherCode: weatherCodes[i],
  isDay: Boolean(isDay[i]),
  icon: getWeatherIcon(weatherCodes[i]),
}));

// Filter to get only the next 8 hours from now
const now = new Date();
const futureForecasts = forecasts
  .filter((forecast) => {
    const isFuture = forecast.time > now;
    return isFuture;
  })
  .slice(0, 8);

//   generate the weathercard for the dom
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
    weatherCard.appendChild(time);
    weatherCard.appendChild(iconImg);
    weatherCard.appendChild(tempElem);
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

console.log(futureForecasts);

console.log(weatherCodes);
