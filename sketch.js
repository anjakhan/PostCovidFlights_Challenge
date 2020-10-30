let slider = document.getElementById("myRange");
let output = document.getElementById("demo");
let date = new Date(slider.value*1000).toLocaleDateString("en-US");
output.innerHTML = date;

// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Subscriber Mapping Visualization
// https://youtu.be/Ae73YY_GAU8

let flightData;

const mappa = new Mappa('Leaflet');
let trainMap;
let canvas;

let data = [];

const options = {
  lat: 0,
  lng: 0,
  zoom: 1.5,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function preload() {
  flightData = loadTable('post_covid_flights.csv', 'header');
}

function setup() {
  canvas = createCanvas(800, 600);
  trainMap = mappa.tileMap(options);
  trainMap.overlay(canvas);

  let maxSubs = 0;
  let minSubs = Infinity;

  for (let row of flightData.rows) {
    let latlon = [row.get('lat'), row.get('lon')];
    let year = row.get('Date').slice(0,4);
    let month = row.get('Date').slice(5,7);
    let day = row.get('Date').slice(8,10);
    let date = new Date(Date.UTC(year, month-1, day));
    let timestamp = date.valueOf()/1000;
    if (latlon) {
      let lat = latlon[0];
      let lon = latlon[1];
      let count = Number(row.get('PercentOfBaseline'));
      data.push({
        lat,
        lon,
        count,
        date,
        timestamp
      });
      if (count > maxSubs) {
        maxSubs = count;
      }
      if (count < minSubs) {
        minSubs = count;
      }
    }
  }

  let minD = sqrt(minSubs);
  let maxD = sqrt(maxSubs);

  for (let country of data) {
    country.diameter = map(sqrt(country.count), minD, maxD, 1, 5);
  }
}

function draw() {
  clear();
  for (let country of data) {
    if (country.timestamp == slider.value) {
      const pix = trainMap.latLngToPixel(country.lat, country.lon);
      fill(frameCount % 255, 0, 200, 100);
      const zoom = trainMap.zoom();
      const scl = pow(2, zoom); // * sin(frameCount * 0.1);
      ellipse(pix.x, pix.y, country.diameter * scl);
    }
    
  }
}

slider.oninput = function() {
  let newDate = new Date(this.value*1000).toLocaleDateString("en-US");
  output.innerHTML = newDate;
}