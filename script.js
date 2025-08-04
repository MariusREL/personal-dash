import { workouts } from "./workouts.js";

const weeklyWeatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=60.393&longitude=5.3242&daily=weather_code&current=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&forecast_hours=12&past_hours=1";

// Hourly WeatherAPI and display of daily forecast
import { weatherCodeToIcon } from "./weathercodes.js";
const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=60.39&longitude=5.32&hourly=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&forecast_days=2";

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
    tempElem.textContent =
      Math.floor(parseFloat(forecast.temperature)) + tempUnit;
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

function weatherChecker(arr) {
  if (arr[0] === 0 || arr[0] === 1) {
    return "Sunny";
  } else if (arr[0] === 2 || arr[0] === 3 || arr[0] === 4) {
    return "cloudy";
  } else {
    return "pretty shitty weather";
  }
}

h1Header.innerHTML = `It's ${currentTemp} degrees and ${weatherChecker(
  weatherCodes
)} right now, perfect conditions to go outside`.toLocaleUpperCase();
headerText.appendChild(h1Header);

const date = document.querySelector(".date");
date.textContent = now.toDateString();

// Modal functionality
let selectedActivity = "";
const modal = document.querySelector("#modal");

const activityButtons = document.querySelectorAll(
  "main > .trip-logger .bike, main > .trip-logger .run, main > .trip-logger .hike, .get-started"
);
const closeButton = document.querySelector(".close-modal");

function openModal() {
  if (modal.classList.contains("visible")) {
    return;
  }
  setTimeout(() => {
    modal.classList.remove("invisible");
    modal.classList.add("visible");
    document.body.style.overflow = "hidden";

    setupMondayWeekStart();
  }, 150);

  if (!document.getElementById("modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "modal-backdrop";
    document.body.appendChild(backdrop);
  }

  const backgroundElements = [
    document.querySelector(".hero-container"),
    document.querySelector("main > .trip-logger"),
    document.querySelector(".weather-section"),
    document.querySelector("footer"),
  ];

  backgroundElements.forEach((element) => {
    if (element) {
      element.style.pointerEvents = "none";
      element.classList.add("background-dimmed");
    }
  });
}

function closeModal() {
  modal.classList.remove("visible");
  modal.classList.add("invisible");
  document.body.style.overflow = "auto";

  const backdrop = document.getElementById("modal-backdrop");
  if (backdrop) {
    backdrop.remove();
  }

  const backgroundElements = [
    document.querySelector(".hero-container"),
    document.querySelector("main > .trip-logger"),
    document.querySelector(".weather-section"),
    document.querySelector("footer"),
  ];

  backgroundElements.forEach((element) => {
    if (element) {
      element.style.pointerEvents = "auto";
      element.classList.remove("background-dimmed");
    }
  });
}

activityButtons.forEach((button) => {
  button.addEventListener("click", function (e) {
    openModal();

    setTimeout(() => {
      // Determine which activity was clicked
      let activityType = "";
      if (e.target.classList.contains("run") || e.target.closest(".run")) {
        activityType = "run";
      } else if (
        e.target.classList.contains("bike") ||
        e.target.closest(".bike")
      ) {
        activityType = "bike";
      } else if (
        e.target.classList.contains("hike") ||
        e.target.closest(".hike")
      ) {
        activityType = "hike";
      }

      if (activityType) {
        // Remove active class from all modal buttons
        modalButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to corresponding modal button
        const correspondingModalButton = document.querySelector(
          `#modal-${activityType}`
        );
        if (correspondingModalButton) {
          correspondingModalButton.classList.add("active");
          updateFormForActivity(activityType);
        }
      }
    }, 200);
  });
});

closeButton.addEventListener("click", closeModal);

// Add event listeners for form buttons
const cancelBtn = document.querySelector("#cancel-btn");
const saveBtn = document.querySelector("#save-btn");

cancelBtn.addEventListener("click", closeModal);

// Form submission (you can add functionality later)
document
  .querySelector("#input-container")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    // Form functionality to be added later
    console.log("Form submitted for activity:", selectedActivity);
  });

document.addEventListener("click", (e) => {
  if (e.target.id === "modal-backdrop") {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("visible")) {
    closeModal();
  }
});
const modalButtons = document.querySelectorAll(
  "#modal-hike, #modal-run, #modal-bike"
);

// Function to update form based on selected activity
function updateFormForActivity(activityType) {
  selectedActivity = activityType;
  const formTitle = document.querySelector(".form-title");
  const capitalizedActivity =
    activityType.charAt(0).toUpperCase() + activityType.slice(1);
  formTitle.textContent = `Log Your ${capitalizedActivity}`;

  const distanceInput = document.querySelector("#activity-distance");
  const durationInput = document.querySelector("#activity-duration");

  if (activityType === "bike") {
    distanceInput.placeholder = "e.g., 25.5 km";
    durationInput.placeholder = "e.g., 1hr 30min";
  } else if (activityType === "run") {
    distanceInput.placeholder = "e.g., 5.2 km";
    durationInput.placeholder = "e.g., 45 min";
  } else if (activityType === "hike") {
    distanceInput.placeholder = "e.g., 8.5 km";
    durationInput.placeholder = "e.g., 3 hours";
  }

  initializeDatePicker();
}

function initializeDatePicker() {
  const dateInput = document.querySelector("#activity-date");
  if (!dateInput) return;

  // Initialize Flatpickr with Monday as first day of week
  flatpickr(dateInput, {
    locale: {
      firstDayOfWeek: 1, // Monday = 1, Sunday = 0
    },
    dateFormat: "d-m-Y",
    defaultDate: "today",
    allowInput: false,
    clickOpens: true,
    theme: "light",

    onReady: function (selectedDates, dateStr, instance) {
      const calendar = instance.calendarContainer;
      calendar.style.fontFamily = "var(--default-font-family)";
      calendar.style.fontSize = "0.875rem";
    },
  });
}

function setupMondayWeekStart() {
  initializeDatePicker();
}

modalButtons.forEach(function (button) {
  button.addEventListener("click", function (e) {
    // Remove active class from all buttons
    modalButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to clicked button
    e.target.classList.add("active");

    if (e.target.classList.contains("run")) {
      updateFormForActivity("run");
    } else if (e.target.classList.contains("bike")) {
      updateFormForActivity("bike");
    } else if (e.target.classList.contains("hike")) {
      updateFormForActivity("hike");
    }
  });
});
