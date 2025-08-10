import {
  loadActivitiesFromStorage,
  getWeatherIcon,
  weatherChecker,
  deleteActivity,
  toggleFavorite,
} from "../script.js";
import { weatherCodeToIcon } from "../weathercodes.js";

import { activities as defaultActivities } from "../workouts.js";

const activityCardContainer = document.querySelector(
  ".activity-card-container"
);
const resetButton = document.querySelector("#reset-activities-btn");

if (resetButton) {
  resetButton.addEventListener("click", () => {
    const isConfirmed = confirm(
      "Are you sure? This will delete all logged activities and restore the defaults."
    );
    if (isConfirmed) {
      // Use removeItem for a more targeted clear
      localStorage.removeItem("userActivities");
      // Reload the page to apply the changes
      location.reload();
    }
  });
}

let activities = loadActivitiesFromStorage() || defaultActivities;

// Debug logging
console.log("Activities loaded:", activities);
console.log("Default activities:", defaultActivities);

const activityFilter = document.querySelector("#activityFilter");
const weatherFilter = document.querySelector("#weatherFilter");
const sortFilter = document.querySelector("#sortFilter");

// Weather type mapping
const weatherTypeMap = {
  clear: [0, 1], // Clear sky, mainly clear
  cloudy: [2, 3], // Partly cloudy, overcast
  rain: [61, 63, 65, 80, 81, 82], // Rain, showers
  drizzle: [51, 53, 55], // Drizzle
  snow: [71, 73, 75, 77, 85, 86], // Snow and snow grains
  thunderstorm: [95, 96, 99], // Thunderstorm
};

// Helper function to convert duration to minutes for sorting
const durationToMinutes = (duration) => {
  if (!duration || duration === "placeholder") return 0;

  let totalMinutes = 0;
  const parts = duration.split(" ");

  parts.forEach((part) => {
    if (part.includes("h")) {
      totalMinutes += parseInt(part.replace("h", "")) * 60;
    } else if (part.includes("m")) {
      totalMinutes += parseInt(part.replace("m", ""));
    }
  });

  return totalMinutes;
};

const filterAndSortActivities = () => {
  const activityType = activityFilter.value;
  const weatherType = weatherFilter.value;
  const sortType = sortFilter.value;

  let filteredActivities = [...activities];

  // Filter by activity type (skip when using Favorites filter)
  if (activityType !== "all" && activityType !== "favorites") {
    filteredActivities = filteredActivities.filter(
      (activity) => activity.activityType.toLowerCase() === activityType
    );
  }

  // Filter by weather type
  if (weatherType !== "all") {
    const weatherCodes = weatherTypeMap[weatherType];
    filteredActivities = filteredActivities.filter((activity) =>
      weatherCodes.includes(activity.weatherCode)
    );
  }

  // Filter by favorites
  if (activityType === "favorites") {
    filteredActivities = filteredActivities.filter(
      (activity) => activity.isFavorite === true
    );
  }

  // Sort activities
  filteredActivities.sort((a, b) => {
    switch (sortType) {
      case "date":
        // Convert dd-mm-yyyy to Date object for comparison
        const dateA = new Date(a.date.split("-").reverse().join("-"));
        const dateB = new Date(b.date.split("-").reverse().join("-"));
        return dateB - dateA; // Newest first

      case "duration-desc":
        return durationToMinutes(b.duration) - durationToMinutes(a.duration);

      case "duration-asc":
        return durationToMinutes(a.duration) - durationToMinutes(b.duration);

      case "distance-desc":
        return parseFloat(b.distance || 0) - parseFloat(a.distance || 0);

      case "distance-asc":
        return parseFloat(a.distance || 0) - parseFloat(b.distance || 0);

      default:
        return 0;
    }
  });

  return filteredActivities;
};

const createHtmlTemplate = function (activitiesToShow = null) {
  const displayActivities = activitiesToShow || activities;
  activityCardContainer.innerHTML = "";

  console.log("Creating template for activities:", displayActivities);

  if (!displayActivities || displayActivities.length === 0) {
    activityCardContainer.innerHTML =
      '<p style="text-align: center; padding: 2rem;">No activities found.</p>';
    return;
  }

  displayActivities.forEach((activity) => {
    if (!activity) {
      console.error("Activity is undefined:", activity);
      return;
    }

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
      (activity.weather && activity.weather.startsWith("./icons/")
        ? activity.weather.replace("./icons/", "../icons/")
        : activity.weather) ||
      (getWeatherIcon && getWeatherIcon(activity.weatherCode)
        ? getWeatherIcon(activity.weatherCode).replace("./icons/", "../icons/")
        : "../icons/clear-day.svg");

    const weatherDesc =
      activity.weatherDescription ||
      (activity.weatherCode && weatherChecker
        ? weatherChecker([activity.weatherCode])
        : "Weather");

    // Ensure all required fields have fallback values
    const safeActivity = {
      id: activity.id || "unknown",
      activityType: activity.activityType || "Unknown",
      duration: activity.duration || "N/A",
      distance: activity.distance || "0",
      date: activity.date || "Unknown date",
      location: activity.location || "Unknown location",
      comment: activity.comment || "No comment",
      temperature: activity.temperature || "N/A",
      isFavorite: Boolean(activity.isFavorite),
    };

    activityCardContainer.innerHTML += `
      <div class="activity-card" data-id="${safeActivity.id}">
        <div class="card-actions">
          <button class="favorite-btn ${
            safeActivity.isFavorite ? "favorited" : ""
          }" title="${
      safeActivity.isFavorite ? "Remove from favorites" : "Add to favorites"
    }">
            <i class="fa${safeActivity.isFavorite ? "s" : "r"} fa-star"></i>
          </button>
          <button class="delete-btn" title="Delete activity">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <section class="info">
          <div class="activityDate">
            <i class="${activityIcon}"></i>
            <div class="infotext">
              <h2 class="runTitle">${
                safeActivity.activityType.charAt(0).toUpperCase() +
                safeActivity.activityType.slice(1)
              }</h2>
              <p class="date">${safeActivity.date}</p>
            </div>
          </div>
          <div class="duration">
            <i class="fa-regular fa-clock"></i>
            <div class="infotext">
              <h2>${safeActivity.duration}</h2>
              <p>duration</p>
            </div>
          </div>
          <div class="distance">
            <img src="../img/icons8-pulse-30.png" alt="A pulse sound wave" />
            <div class="infotext">
              <h2>${safeActivity.distance} km</h2>
              <p>distance</p>
            </div>
          </div>
          <div class="weather">
            <img src="${weatherIcon}" alt="Weather icon" />
            <div class="infotext">
              <h2>${safeActivity.temperature}</h2>
              <p>${weatherDesc}</p>
            </div>
          </div>
        </section>
        <section class="locationComment">
          <p>${safeActivity.location}</p>
          <p>${safeActivity.comment}</p>
        </section>
      </div>
    `;
  });

  // Add event listeners to the new buttons
  addButtonEventListeners();
};

// Function to add event listeners to delete and favorite buttons
const addButtonEventListeners = () => {
  // Delete button event listeners
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = e.target.closest(".activity-card");
      const activityId = parseInt(card.dataset.id);

      if (confirm("Are you sure you want to delete this activity?")) {
        const success = deleteActivity(activityId);
        if (success) {
          // Update activities array from storage
          activities.length = 0;
          activities.push(
            ...(loadActivitiesFromStorage() || defaultActivities)
          );
          const filteredActivities = filterAndSortActivities();
          createHtmlTemplate(filteredActivities);
        }
      }
    });
  });

  // Favorite button event listeners
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = e.target.closest(".activity-card");
      const activityId = parseInt(card.dataset.id);

      const success = toggleFavorite(activityId);
      if (success !== false) {
        // Update activities array from storage
        activities.length = 0;
        activities.push(...(loadActivitiesFromStorage() || defaultActivities));
        const filteredActivities = filterAndSortActivities();
        createHtmlTemplate(filteredActivities);
      }
    });
  });
};

// Event listeners for filters
activityFilter.addEventListener("change", () => {
  const filteredActivities = filterAndSortActivities();
  createHtmlTemplate(filteredActivities);
});

weatherFilter.addEventListener("change", () => {
  const filteredActivities = filterAndSortActivities();
  createHtmlTemplate(filteredActivities);
});

sortFilter.addEventListener("change", () => {
  const filteredActivities = filterAndSortActivities();
  createHtmlTemplate(filteredActivities);
});

// Initial load
try {
  createHtmlTemplate();
} catch (error) {
  console.error("Error during initial load:", error);
  if (activityCardContainer) {
    activityCardContainer.innerHTML =
      '<p style="text-align: center; color: red; padding: 2rem;">Error loading activities. Please check the console for details.</p>';
  }
}
