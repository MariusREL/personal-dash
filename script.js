import { workouts } from "./workouts.js";
console.log(workouts);
const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,weather_code,is_day&forecast_hours=6";

async function getWeatherData() {
  let response = await fetch(weatherUrl);
  if (!response.ok) {
    console.error("error");
    return null
  }
  let weatherData = await response.json();
  return weatherData;
}

console.log(getWeatherData());
