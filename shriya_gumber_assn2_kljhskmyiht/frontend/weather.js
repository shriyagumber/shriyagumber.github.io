// const BACKEND_URL = "http://127.0.0.1:5001";
const BACKEND_URL = "https://csci571assn2-436703.wl.r.appspot.com/";

var latitude;
var longitude;
var current_status_location;

const ASSETS_PREFIX = "../assets";
const ICON_PREFIX = `${ASSETS_PREFIX}/Weather Symbols for Weather Codes`;
const weatherCode_icon = {
  4201: ["Heavy Rain", "rain_heavy.svg"],
  4001: ["Rain", "rain.svg"],
  4200: ["Light Rain", "rain_light.svg"],
  6201: ["Heave Freezing Rain", "freezing_rain_heavy.svg"],
  6001: ["Freezing Rain", "freezing_rain.svg"],
  6200: ["Light Freezing Rain", "freezing_rain_light.svg"],
  6000: ["Freezing Drizzle", "freekzing_drizzle.svg"],
  4000: ["Drizzle", "drizzle.svg"],
  7101: ["Heavy Ice Pellets", "ice_pellets_heavy.svg"],
  7000: ["Ice Pellets", "ice_pellets.svg"],
  7102: ["Light Ice Pellets", "ice_pellets_light.svg"],
  5101: ["Heavy Snow", "snow_heavy.svg"],
  5000: ["Snow", "snow.svg"],
  5100: ["Light Snow", "snow_light.svg"],
  5001: ["Flurries", "flurries.svg"],
  8000: ["Thunderstorm", "tstorm.svg"],
  2100: ["Light Fog", "fog_light.svg"],
  2000: ["Fog", "fog.svg"],
  1001: ["Cloudy", "cloudy.svg"],
  1102: ["Mostly Cloudy", "mostly_cloudy.svg"],
  1101: ["Partly Cloudy", "partly_cloudy_day.svg"],
  1100: ["Mostly Clear", "mostly_clear_day.svg"],
  1000: ["Clear, Sunny", "clear_day.svg"],
};

const precipitationType_mapping = {
  0: "N/A",
  1: "Rain",
  2: "Snow",
  3: "Freezing Rain",
  4: "Ice Pellets",
};
async function getLoc() {
  var decider = document.getElementById("checkbox");
  if (decider.checked) {
    const response = await fetch("https://ipinfo.io/json");
    const response_json = await response.json();
    latitude = response_json.loc.split(",")[0];
    longitude = response_json.loc.split(",")[1];
    current_status_location = `${response_json.city}, ${response_json.region}`;

    document.getElementById("street-tooltip").style.visibility = "hidden";
    document.getElementById("city-tooltip").style.visibility = "hidden";
    document.getElementById("state-tooltip").style.visibility = "hidden";
  }
}

function disableOtherInput() {
  var decider = document.getElementById("checkbox");
  var street = document.getElementById("street");
  var city = document.getElementById("city");
  var state = document.getElementById("state");
  if (decider.checked) {
    street.value = "";
    street.disabled = true;
    city.disabled = true;
    city.value = "";
    state.disabled = true;
    state.value = "";
  } else {
    street.disabled = false;
    city.disabled = false;
    state.disabled = false;
  }
}

async function setCurrentCard() {
  const url_tomorrow = `${BACKEND_URL}/today_weather_info?latitude=${latitude}&longitude=${longitude}`;
  var response_tomorrow = await fetch(url_tomorrow);
  response_tomorrow = await response_tomorrow.json();

  document.getElementById(
    "current-location-value"
  ).innerHTML = `${current_status_location}`;
  document.getElementById(
    "current-temp-value"
  ).innerHTML = `${response_tomorrow.temperature}&deg;`;
  document.getElementById("current-status-image").src = `${ICON_PREFIX}/${
    weatherCode_icon[response_tomorrow.weatherCode][1]
  }`;
  document.getElementById("current-status-title").innerHTML =
    weatherCode_icon[response_tomorrow.weatherCode][0];
  document.getElementById(
    "current-humidity-text"
  ).innerHTML = `${response_tomorrow.humidity}%`;
  document.getElementById(
    "current-pressure-text"
  ).innerHTML = `${response_tomorrow.pressureSeaLevel}inHg`;
  document.getElementById(
    "current-windspeed-text"
  ).innerHTML = `${response_tomorrow.windSpeed}mph`;
  document.getElementById(
    "current-visibility-text"
  ).innerHTML = `${response_tomorrow.visibility}mi`;
  document.getElementById(
    "current-cloudcover-text"
  ).innerHTML = `${response_tomorrow.cloudCover}%`;
  document.getElementById(
    "current-uvlevel-text"
  ).innerHTML = `${response_tomorrow.uvIndex}`;
}

function getDateFmt(dateObj) {
  const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const date = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
  const year = dateObj.toLocaleDateString("en-US", { year: "numeric" });

  return `${day}, ${date} ${month} ${year}`;
}

async function setWeeklyCard() {
  const url_tomorrow = `${BACKEND_URL}/week_weather_info?latitude=${latitude}&longitude=${longitude}`;
  var response_tomorrow = await fetch(url_tomorrow);
  response_tomorrow = await response_tomorrow.json();

  const container = document.getElementById("week-rows-container");
  container.innerHTML = "";

  var row_number = 0;
  for (var row of response_tomorrow) {
    const dateObj = new Date(row.startTime);
    const values = row.values;

    const date = getDateFmt(dateObj);
    const weatherCode = values.weatherCode;
    const statusImage = `${ICON_PREFIX}/${weatherCode_icon[weatherCode][1]}`;
    const statusTitle = `${weatherCode_icon[weatherCode][0]}`;
    const tempHigh = values.temperatureMax;
    const tempLow = values.temperatureMin;
    const windSpeed = values.windSpeed;

    container.innerHTML += `
            <div id="week-row-container" onclick="getDetailedInfo(${row_number})">
                <div class="week-row week-header-date">${date}</div>
                <div class="week-row week-header-status">
                    <img class="week-row-status-img" src="${statusImage}"/>
                    <div class="week-row-status-text">${statusTitle}</div>
                </div>
                <div class="week-row week-header-temphigh">${tempHigh}</div>
                <div class="week-row week-header-templow">${tempLow}</div>
                <div class="week-row week-header-windspeed">${windSpeed}</div>
            </div>
        `;
    row_number += 1;
  }
}

function getHourFmt(dateStr) {
  const dateObj = new Date(dateStr);
  let hour = dateObj.getHours();
  if (hour > 12) {
    hour = `${hour % 12}PM`;
  } else {
    hour = `${hour % 12}AM`;
  }
  return hour;
}

async function getDetailedInfo(row_number) {
  document.getElementById("current-w-container").style.display = "none";
  document.getElementById("week-w-container").style.display = "none";
  document.getElementById("day-w-info-container").style.display = "block";
  document.getElementById("day-w-charts-open").style.display = "flex";

  const url_tomorrow = `${BACKEND_URL}/week_weather_info?latitude=${latitude}&longitude=${longitude}`;
  var response_tomorrow = await fetch(url_tomorrow);
  response_tomorrow = await response_tomorrow.json();
  const container = document.getElementById("week-rows-container");

  const dateObj = new Date(response_tomorrow[row_number].startTime);
  var detailedInfo = response_tomorrow[row_number].values;
  const date = getDateFmt(dateObj);

  const weatherCode = detailedInfo.weatherCode;
  const statusImage = `${ICON_PREFIX}/${weatherCode_icon[weatherCode][1]}`;
  const statusTitle = `${weatherCode_icon[weatherCode][0]}`;
  const tempHigh = detailedInfo.temperatureMax;
  const tempLow = detailedInfo.temperatureMin;
  const windSpeed = detailedInfo.windSpeed;
  const humidity = detailedInfo.humidity;
  const visibility = detailedInfo.visibility;

  const sunriseTime = detailedInfo.sunriseTime;
  const sunriseHour = getHourFmt(sunriseTime);
  const sunsetTime = detailedInfo.sunsetTime;
  const sunsetHour = getHourFmt(sunsetTime);

  const precipitationType = detailedInfo.precipitationType;
  const precipitationType_value = `${precipitationType_mapping[precipitationType]}`;
  const precipitationProbability = detailedInfo.precipitationProbability;

  document.getElementById(
    "day-w-info-bottom-right-precipitation"
  ).innerHTML = `${precipitationType_value}`;
  document.getElementById(
    "day-w-info-bottom-right-chanceofrain"
  ).innerHTML = `${precipitationProbability}%`;
  document.getElementById(
    "day-w-info-bottom-right-windspeed"
  ).innerHTML = `${windSpeed} mph`;
  document.getElementById(
    "day-w-info-bottom-right-humidity"
  ).innerHTML = `${humidity}%`;
  document.getElementById(
    "day-w-info-bottom-right-visibility"
  ).innerHTML = `${visibility} mi`;
  document.getElementById(
    "day-w-info-bottom-right-time"
  ).innerHTML = `${sunriseHour}/${sunsetHour}`;
  document.getElementById(
    "day-w-info-top-image"
  ).innerHTML = `${ICON_PREFIX}/${weatherCode_icon[weatherCode][1]}`;
  document.getElementById("day-w-info-top-date").innerHTML = `${date}`;
  document.getElementById("day-w-info-top-status").innerHTML =
    weatherCode_icon[weatherCode][0];
  document.getElementById(
    "day-w-info-top-temp"
  ).innerHTML = `${tempHigh}&deg;F/${tempLow}&deg;F`;
}

async function getHourInfo() {
  let src = document.getElementById("day-w-charts-arrow").src;
  if (src.includes("point-up-512.png")) {
    document.getElementById("day-w-charts-container").style.display = "none";
    document.getElementById("day-w-charts-arrow").src =
      "../assets/point-down-512.png";
  } else {
    document.getElementById("day-w-charts-container").style.display = "block";
    document.getElementById("day-w-charts-arrow").src =
      "../assets/point-up-512.png";
    window.location = "#day-w-charts-container";

    const url_tomorrow_fiveD = `${BACKEND_URL}/fiveD_weather_info?latitude=${latitude}&longitude=${longitude}`;
    var response_tomorrow_fiveD = await fetch(url_tomorrow_fiveD);
    response_tomorrow_fiveD = await response_tomorrow_fiveD.json();
    function createTempChart(divID, response) {
      let data = [];
      for (let row of response) {
        let startTime = new Date(row["startTime"]).getTime();
        let tempMin = row["values"]["temperatureMin"];
        let tempMax = row["values"]["temperatureMax"];
        data.push([startTime, tempMin, tempMax]);
      }

      Highcharts.chart(divID, {
        chart: {
          type: "arearange",
          zooming: {
            type: "x",
          },
          scrollablePlotArea: {
            minWidth: 600,
            scrollPositionX: 1,
          },
        },
        title: {
          text: "Temperature Ranges (Min, Max)",
        },
        xAxis: {
          type: "datetime",
          accessibility: {
            rangeDescription: "Range: Jan 1st 2017 to Dec 31 2017.",
          },
        },
        yAxis: {
          title: {
            text: null,
          },
        },
        tooltip: {
          crosshairs: true,
          shared: true,
          valueSuffix: "°F",
          xDateFormat: "%A, %b %e",
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            name: "Temperatures",
            data: data,
            color: {
              linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1,
              },
              stops: [
                [0, "orange"],
                [1, "skyblue"],
              ],
            },
            marker: {
              fillColor: "skyblue",
            },
            lineColor: "orange",
          },
        ],
      });
    }
    const tempChartID = "day-w-charts-chart1";
    createTempChart(tempChartID, response_tomorrow_fiveD);

    const url_tomorrow_hour = `${BACKEND_URL}/hour_weather_info?latitude=${latitude}&longitude=${longitude}`;
    var response_tomorrow_hour = await fetch(url_tomorrow_hour);
    response_tomorrow_hour = await response_tomorrow_hour.json();

    function createHourChart(divID, response) {
      function parseData(response) {
        const humidity = [];
        const winds = [];
        const temperatures = [];
        const pressures = [];

        let counter = 0;
        for (let row of response) {
          const startTime = new Date(row["startTime"]).getTime();
          temperatures.push({ x: startTime, y: row["values"]["temperature"] });
          humidity.push({
            x: startTime,
            y: parseInt(row["values"]["humidity"]),
            dataLabels: {
              enabled: counter % 2 == 0,
              allowOverlap: true,
              style: {
                fontSize: "6px",
                color: "#666",
              },
            },
          });
          pressures.push({
            x: startTime,
            y: row["values"]["pressureSeaLevel"],
          });
          if (counter % 2 == 0)
            winds.push({
              x: startTime,
              value: row["values"]["windSpeed"],
              direction: row["values"]["windDirection"],
            });
          counter += 1;
        }

        return {
          temperature: temperatures,
          humidity: humidity,
          pressure: pressures,
          wind: winds,
        };
      }

      function getChartOptions(divID, data) {
        return {
          chart: {
            renderTo: divID,
            marginBottom: 70,
            marginRight: 40,
            marginTop: 50,
            plotBorderWidth: 1,
            alignTicks: false,
            scrollablePlotArea: {
              minWidth: 720,
            },
          },

          title: {
            text: "Hourly Weather (For Next 5 Days)",
            align: "center",
            style: {
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            },
          },

          credits: {
            text: "Forecast",
            href: "https://yr.no",
            position: {
              x: -40,
            },
          },

          // TODO
          tooltip: {
            shared: true,
            useHTML: true,
            headerFormat:
              "<small>{point.x:%A, %b %e, %H:%M} - " +
              "{point.point.to:%H:%M}</small><br>" +
              "<b>{point.point.symbolName}</b><br>",
          },

          xAxis: [
            {
              // Bottom X axis
              type: "datetime",
              tickInterval: 8 * 36e5, // two hours
              minorTickInterval: 36e5, // one hour
              tickLength: 0,
              gridLineWidth: 1,
              gridLineColor: "rgba(128, 128, 128, 0.1)",
              startOnTick: false,
              endOnTick: false,
              minPadding: 0,
              maxPadding: 0,
              offset: 30,
              showLastLabel: true,
              labels: {
                format: "{value:%H}",
              },
              crosshair: true,
            },
            {
              // Top X axis
              linkedTo: 0,
              type: "datetime",
              tickInterval: 24 * 3600 * 1000,
              labels: {
                format:
                  '{value:<span style="font-size: 12px; font-weight: ' +
                  'bold">%a</span> %b %e}',
                align: "left",
                x: 3,
                y: 8,
              },
              opposite: true,
              tickLength: 20,
              gridLineWidth: 1,
            },
          ],

          yAxis: [
            {
              // temperature axis
              title: {
                text: null,
              },
              labels: {
                format: "{value}°",
                style: {
                  fontSize: "10px",
                },
                x: -3,
              },
              maxPadding: 0.3,
              minRange: 8,
              tickInterval: 1,
              gridLineColor: "rgba(128, 128, 128, 0.1)",
            },
            {
              // Humidity
              title: {
                text: null,
              },
              labels: {
                enabled: false,
              },
              gridLineWidth: 0,
              tickLength: 0,
              minRange: 10,
              min: 0,
            },
            {
              // Air pressure
              allowDecimals: false,
              title: {
                // Title on top of axis
                text: "inHg",
                offset: 0,
                align: "high",
                rotation: 0,
                style: {
                  fontSize: "10px",
                  color: "orange",
                },
                textAlign: "left",
                x: 3,
              },
              labels: {
                style: {
                  fontSize: "8px",
                  color: "orange",
                },
                y: 2,
                x: 3,
              },
              gridLineWidth: 0,
              opposite: true,
              showLastLabel: true,
              // TODO: set the minRange to very high value to only keep one label on y-axis
            },
          ],

          legend: {
            enabled: false,
          },

          plotOptions: {
            series: {
              pointPlacement: "between",
            },
          },

          series: [
            {
              name: "Temperature",
              data: data.temperature,
              type: "spline",
              marker: {
                enabled: false,
                states: {
                  hover: {
                    enabled: true,
                  },
                },
              },
              tooltip: {
                pointFormat:
                  '<span style="color:{point.color}">\u25CF</span>' +
                  " " +
                  "{series.name}: <b>{point.y}°F</b><br/>",
              },
              zIndex: 5,
              color: "#FF3333",
              negativeColor: "#48AFE8",
            },
            {
              name: "Wind",
              type: "windbarb",
              id: "windbarbs",
              color: Highcharts.getOptions().colors[1],
              lineWidth: 1,
              data: data.wind,
              vectorLength: 10,
              tooltip: {
                valueSuffix: " mph",
              },
            },
            {
              name: "Humidity",
              color: "rgb(150 204 249)",
              data: data.humidity,
              type: "column",
              groupPadding: 0,
              pointPadding: 0,
              grouping: false,
              tooltip: {
                valueSuffix: " %",
              },
              yAxis: 1,
              zIndex: -1,
              states: {
                hover: {
                  brightness: 0.2,
                  color: "rgb(189, 225, 254)",
                },
              },
            },
            {
              name: "Air pressure",
              color: "orange",
              data: data.pressure,
              marker: {
                enabled: false,
              },
              shadow: false,
              tooltip: {
                valueSuffix: " inHg",
              },
              dashStyle: "shortdot",
              yAxis: 2,
              zIndex: 10,
            },
          ],
        };
      }

      function drawBlocksForWindArrows(chart) {
        const xAxis = chart.xAxis[0];
        for (
          let pos = xAxis.min, max = xAxis.max, i = 0;
          pos <= max + 36e5;
          pos += 36e5, i += 1
        ) {
          // Get the X position
          const isLast = pos === max + 36e5,
            x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

          // Draw the vertical dividers and ticks
          const isLong =
            this.resolution > 36e5 ? pos % this.resolution === 0 : i % 2 === 0;

          chart.renderer
            .path([
              "M",
              x,
              chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
              "L",
              x,
              chart.plotTop + chart.plotHeight + 20,
              "Z",
            ])
            .attr({
              stroke: chart.options.chart.plotBorderColor,
              "stroke-width": 1,
            })
            .add();
        }

        // Center items in block
        chart.get("windbarbs").markerGroup.attr({
          translateX: chart.get("windbarbs").markerGroup.translateX + 4,
        });
      }

      const parsedData = parseData(response);
      const chartOptions = getChartOptions(divID, parsedData);
      const chart = new Highcharts.Chart(chartOptions, drawBlocksForWindArrows);
    }

    const hourChartID = "day-w-charts-chart2";
    createHourChart(hourChartID, response_tomorrow_hour);
  }
}

async function handleSubmit() {
  var decider = document.getElementById("checkbox");

  if (!decider.checked) {
    var street = document.getElementById("street").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    const TOOLTIP_TIMEOUT = 3000;

    if (street == "") {
      document.getElementById("street-tooltip").style.visibility = "visible";
      setTimeout(() => {
        document.getElementById("street-tooltip").style.visibility = "hidden";
      }, TOOLTIP_TIMEOUT);
      return;
    } else if (city == "") {
      document.getElementById("city-tooltip").style.visibility = "visible";
      setTimeout(() => {
        document.getElementById("city-tooltip").style.visibility = "hidden";
      }, TOOLTIP_TIMEOUT);
      return;
    } else if (state == "") {
      document.getElementById("state-tooltip").style.visibility = "visible";
      setTimeout(() => {
        document.getElementById("state-tooltip").style.visibility = "hidden";
      }, TOOLTIP_TIMEOUT);
      return;
    } else {
      var address = String(street) + "+" + String(city) + "+" + String(state);
      const url_geocoding = `${BACKEND_URL}/get_geocoding?address=${address}`;
      var response_geocoding = await fetch(url_geocoding);
      response_geocoding = await response_geocoding.json();

      latitude = response_geocoding.results[0].geometry.location.lat;
      longitude = response_geocoding.results[0].geometry.location.lng;
      current_status_location = response_geocoding.results[0].formatted_address;
    }
  }

  await setCurrentCard();
  await setWeeklyCard();

  document.getElementById("current-w-container").style.display = "block";
  document.getElementById("week-w-container").style.display = "block";
}

function handleClear() {
  var street = document.getElementById("street");
  var city = document.getElementById("city");
  var state = document.getElementById("state");
  street.value = "";
  city.value = "";
  state.value = "";
  street.disabled = false;
  city.disabled = false;
  state.disabled = false;
  document.getElementById("checkbox").checked = false;

  document.getElementById("current-w-container").style.display = "none";
  document.getElementById("week-w-container").style.display = "none";
  document.getElementById("day-w-info-container").style.display = "none";
  document.getElementById("day-w-charts-open").style.display = "none";
  document.getElementById("day-w-charts-container").style.display = "none";
}
