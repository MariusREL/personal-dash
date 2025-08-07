import { weatherCodeToIcon } from "../weathercodes.js";
import { activities } from "../workouts.js";

const activityCardContainer = document.querySelector(
  "#activity-card-container"
);

const createHtmlTemplate = function () {
  activities.forEach((activity) => {
    activityCardContainer.innerHTML += `
      
        <div class="activity-card">
          <section class="info">
            <div class="activityDate">
              <i class="fa-solid fa-person-running"></i>
              <div class="infotext">
                <h2 class="runTitle">Running</h2>
                <p class="date">01.15.2025</p>
              </div>
            </div>
            <div class="duration">
              <i class="fa-regular fa-clock"></i>
              <div class="infotext">
                <h2>45 min</h2>
                <p>duration</p>
              </div>
            </div>

            <div class="distance">
              <img src="../img/icons8-pulse-30.png" alt="A pulse sound wave" />
              <div class="infotext">
                <h2>5.2 km</h2>
                <p>distance</p>
              </div>
            </div>
            <div class="weather">
              <img src="../icons/clear-day.svg" alt="The sun" />
              <div class="infotext">
                <h2>22C</h2>
                <p>Sunny</p>
              </div>
            </div>
          </section>
          `;
  });
};
createHtmlTemplate();
