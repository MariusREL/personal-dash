import { activities } from "./workouts.js";
// import { logActivity } from "./logActivity.js";

// Function to load activities from localStorage
function loadActivitiesFromStorage() {
  try {
    const storedActivities = localStorage.getItem("userActivities");
    if (storedActivities) {
      const savedActivities = JSON.parse(storedActivities);
      // Clear existing activities and add saved ones
      activities.length = 0;
      activities.push(...savedActivities);
    } else {
      // First time user - save the default activities to localStorage
      saveActivitiesToStorage();
    }
  } catch (error) {
    console.error("Error loading activities from localStorage:", error);
    // Keep the default activities from workouts.js if localStorage fails
  }
}

// Function to save activities to localStorage
function saveActivitiesToStorage() {
  try {
    localStorage.setItem("userActivities", JSON.stringify(activities));
  } catch (error) {
    console.error("Error saving activities to localStorage:", error);
  }
}

// Function to add a new activity and save to storage
function addActivity(newActivity) {
  activities.push(newActivity);
  saveActivitiesToStorage();
}

loadActivitiesFromStorage();

const weeklyWeatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=60.393&longitude=5.3242&daily=weather_code&current=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&forecast_hours=12&past_hours=1";

// Hourly WeatherAPI and display of daily forecast
import { weatherCodeToIcon } from "./weathercodes.js";

const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=60.39&longitude=5.32&hourly=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&forecast_days=7&past_days=7";

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
    return "pretty awful weather";
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

const modalButtons = document.querySelectorAll(
  "#modal-hike, #modal-run, #modal-bike"
);

function openModal() {
  if (modal.classList.contains("visible")) {
    return;
  }
  setTimeout(() => {
    modal.classList.remove("invisible");
    modal.classList.add("visible");
    document.body.style.overflow = "hidden";

    setupMondayWeekStart();
  }, 5);

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
  modal.classList.add("invisible");
  modal.classList.remove("visible");
  document.body.style.overflow = "auto";

  if (
    window.datePickerInstance &&
    typeof window.datePickerInstance.destroy === "function"
  ) {
    window.datePickerInstance.destroy();
    window.datePickerInstance = null;
  }

  const flatpickrElements = document.querySelectorAll(
    ".flatpickr-calendar, .flatpickr-overlay"
  );
  flatpickrElements.forEach((element) => {
    if (element && element.parentNode) {
      element.style.display = "none";
      element.parentNode.removeChild(element);
    }
  });

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

  const form = document.querySelector("#input-container");
  if (form) {
    form.reset();
    form.style.display = "none";
    setTimeout(() => {
      form.style.display = "";
    }, 50);
  }

  if (modalButtons) {
    modalButtons.forEach((btn) => btn.classList.remove("active"));
  }

  const formTitle = document.querySelector(".form-title");
  if (formTitle) {
    formTitle.textContent = "Log Your Activity";
  }

  const formActions = document.querySelector(".form-actions");
  if (formActions) {
    formActions.style.display = "none";
    setTimeout(() => {
      formActions.style.display = "";
    }, 50);
  }
}

activityButtons.forEach((button) => {
  button.addEventListener("click", function (e) {
    openModal();

    setTimeout(() => {
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
        modalButtons.forEach((btn) => btn.classList.remove("active"));

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

const cancelBtn = document.querySelector("#cancel-btn");

cancelBtn.addEventListener("click", closeModal);

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

function updateFormForActivity(activityType) {
  selectedActivity = activityType;
  const formTitle = document.querySelector(".form-title");
  const capitalizedActivity =
    activityType.charAt(0).toUpperCase() + activityType.slice(1);
  formTitle.textContent = `Log Your ${capitalizedActivity}`;

  const distanceInput = document.querySelector("#activity-distance");
  const startTimeInput = document.querySelector("#activity-start-time");
  const endTimeInput = document.querySelector("#activity-end-time");

  if (activityType === "bike") {
    distanceInput.placeholder = "25";
    startTimeInput.placeholder = "09:00";
    endTimeInput.placeholder = "10:30";
  } else if (activityType === "run") {
    distanceInput.placeholder = "5.2";
    startTimeInput.placeholder = "07:00";
    endTimeInput.placeholder = "07:45";
  } else if (activityType === "hike") {
    distanceInput.placeholder = "8.5";
    startTimeInput.placeholder = "08:00";
    endTimeInput.placeholder = "11:00";
  }

  if (!window.datePickerInstance) {
    initializeDatePicker();
  }
}

function initializeDatePicker() {
  const dateInput = document.querySelector("#activity-date");
  if (!dateInput) return;

  if (
    window.datePickerInstance &&
    typeof window.datePickerInstance.destroy === "function"
  ) {
    window.datePickerInstance.destroy();
    window.datePickerInstance = null;
  }

  window.datePickerInstance = flatpickr(dateInput, {
    locale: {
      firstDayOfWeek: 1,
    },
    dateFormat: "d-m-Y",
    defaultDate: "today",
    allowInput: false,
    clickOpens: true,
    theme: "light",

    onReady: function (selectedDates, dateStr, instance) {
      if (instance && instance.calendarContainer) {
        const calendar = instance.calendarContainer;
        calendar.style.fontFamily = "var(--default-font-family)";
        calendar.style.fontSize = "0.875rem";
      }
    },
  });
}

function setupMondayWeekStart() {
  if (!window.datePickerInstance) {
    initializeDatePicker();
  }
}

modalButtons.forEach(function (button) {
  button.addEventListener("click", function (e) {
    modalButtons.forEach((btn) => btn.classList.remove("active"));
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

const inputForm = document.querySelector("#input-container");
const activityStartTime = document.querySelector("#activity-start-time");
const activityEndTime = document.querySelector("#activity-end-time");
const activityDistance = document.querySelector("#activity-distance");
const activityLocation = document.querySelector("#activity-location");
const activityDate = document.querySelector("#activity-date");
const activityComment = document.querySelector("#activity-comment");

// Function to calculate duration between start and end time
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "";

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  // Convert to minutes for easier calculation
  const startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  // Handle case where activity crosses midnight
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add 24 hours worth of minutes
  }

  const durationMinutes = endTotalMinutes - startTotalMinutes;

  // Convert back to hours and minutes
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  // Format duration string
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

function showSuccessConfirmation(activityType, duration, distance) {
  const confirmation = document.createElement("div");
  confirmation.className = "success-confirmation";
  confirmation.innerHTML = `
    <div class="confirmation-content">
      <div class="confirmation-icon">✅</div>
      <div class="confirmation-text">
        <strong>${
          activityType.charAt(0).toUpperCase() + activityType.slice(1)
        } logged!</strong>
        <span>${duration} • ${distance} km</span>
      </div>
    </div>
  `;

  document.body.appendChild(confirmation);

  setTimeout(() => {
    if (confirmation && confirmation.parentNode) {
      confirmation.classList.add("confirmation-fade-out");
      setTimeout(() => confirmation.remove(), 300);
    }
  }, 3000);
}
// get weather depending on which date the user picks and save it into the activities

function getWeatherForDate(selectedDate, selectedTime) {
  // Convert d-m-Y format to YYYY-MM-DD format for proper parsing
  const dateParts = selectedDate.split("-");
  const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(
    2,
    "0"
  )}-${dateParts[0].padStart(2, "0")}`;
  const targetDateTime = new Date(`${formattedDate}T${selectedTime}:00`);

  const findMatchingForecast = forecasts.find((forecast) => {
    const forecastDate = forecast.time;
    const isSameDay =
      forecastDate.toDateString() === targetDateTime.toDateString();
    const hourDiff = Math.abs(
      forecastDate.getHours() - targetDateTime.getHours()
    );

    return isSameDay && hourDiff <= 1;
  });

  if (findMatchingForecast) {
    return {
      weatherCode: findMatchingForecast.weatherCode,
      icon: findMatchingForecast.icon,
      temperature: findMatchingForecast.temperature,
      description: weatherChecker([findMatchingForecast.weatherCode]),
    };
  }

  // Fallback to current weather if no match found
  const fallbackWeatherCode =
    futureForecasts[0]?.weatherCode || weatherCodes[0];
  return {
    weatherCode: fallbackWeatherCode,
    icon: futureForecasts[0]?.icon || getWeatherIcon(fallbackWeatherCode),
    temperature: futureForecasts[0]?.temperature || temperatures[0] + "°C",
    description: weatherChecker([fallbackWeatherCode]),
  };
}

inputForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (selectedActivity !== "") {
    const calculatedDuration = calculateDuration(
      activityStartTime.value,
      activityEndTime.value
    );

    if (!calculatedDuration) {
      alert("Please enter valid start and end times");
      return;
    }
    const weatherForDate = getWeatherForDate(
      activityDate.value,
      activityStartTime.value
    );

    const newActivity = {
      activityType: selectedActivity,
      weather: weatherForDate.icon,
      weatherCode: weatherForDate.weatherCode,
      temperature: weatherForDate.temperature,
      duration: calculatedDuration,
      distance: activityDistance.value,
      comment: activityComment.value,
      date: activityDate.value,
      location: activityLocation.value,
    };

    addActivity(newActivity);

    showSuccessConfirmation(
      selectedActivity,
      calculatedDuration,
      activityDistance.value
    );

    closeModal();
  }
});
