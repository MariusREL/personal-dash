import {
  loadActivitiesFromStorage,
  getWeatherIcon,
  weatherChecker,
} from "../script.js";
import { weatherCodeToIcon } from "../weathercodes.js";
import { activities } from "../workouts.js";

loadActivitiesFromStorage();
const activityCardContainer = document.querySelector(
  "#activity-card-container"
);

const createHtmlTemplate = function () {
  activityCardContainer.innerHTML = "";

  activities.forEach((activity) => {
    let activityIcon = "fa-solid fa-person-running";
    if (
      activity.activityType === "bike" ||
      activity.activityType === "Biking"
    ) {
      activityIcon = "fa-solid fa-person-biking";
    } else if (
      activity.activityType === "hike" ||
      activity.activityType === "Hiking"
    ) {
      activityIcon = "fa-solid fa-person-hiking";
    }

    const weatherIcon =
      activity.weather ||
      getWeatherIcon(activity.weatherCode) ||
      "./icons/clear-day.svg";
    const weatherDesc =
      activity.weatherDescription ||
      (activity.weatherCode
        ? weatherChecker([activity.weatherCode])
        : "Weather");

    activityCardContainer.innerHTML += `
      <div class="activity-card">
        <section class="info">
          <div class="activityDate">
            <i class="${activityIcon}"></i>
            <div class="infotext">
              <h2 class="runTitle">${activity.activityType}</h2>
              <p class="date">${activity.date}</p>
            </div>
          </div>
          <div class="duration">
            <i class="fa-regular fa-clock"></i>
            <div class="infotext">
              <h2>${activity.duration}</h2>
              <p>duration</p>
            </div>
          </div>
          <div class="distance">
            <img src="../img/icons8-pulse-30.png" alt="A pulse sound wave" />
            <div class="infotext">
              <h2>${activity.distance} km</h2>
              <p>distance</p>
            </div>
          </div>
          <div class="weather">
            <img src="${weatherIcon}" alt="Weather icon" />
            <div class="infotext">
              <h2>${activity.temperature}</h2>
              <p>${weatherDesc}</p>
            </div>
          </div>
        </section>
        <section class="locationComment">
          <p>${activity.location}</p>
          <p>${activity.comment}</p>
        </section>
      </div>
    `;
  });
};
createHtmlTemplate();
