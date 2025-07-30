import { workouts } from "./workouts.js";
import { weatherCodeToIcon } from "./weathercodes.js";
const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,weather_code,is_day&forecast_hours=8";

const weatherContainer = document.querySelector("#weather-container");

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

const forecast = time.map((timestamp, i) => ({
  time: new Date(timestamp),
  temperature: temperatures[i] + tempUnit,
  weatherCode: weatherCodes[i],
  isDay: Boolean(isDay[i]),
  icon: getWeatherIcon(weatherCodes[i]),
}));

console.log(forecast[0]);

for (let i = 0; i < 8; i++) {
  const displayIcon = document.createElement("img");
  displayIcon.setAttribute("src", forecast[i].icon);
  displayIcon.style.height = "75px";
  displayIcon.style.width = "75px"; // Fixed: was "100x"
  weatherContainer.appendChild(displayIcon);
}
