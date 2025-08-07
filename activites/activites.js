import { weatherCodeToIcon } from "../weathercodes.js";
import { activities } from "../workouts.js";

const activityCardContainer = document.querySelector(
  "#activity-card-container"
);

const createHtmlTemplate = function () {
  activities.forEach((activity) => {
    activityCardContainer.innerHTML = `
        <div></div>
    `;
  });
};
createHtmlTemplate();
