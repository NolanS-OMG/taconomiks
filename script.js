function getColor(d) {
  let multiplier = 1;
  if (selectedType === tiposDeTaco.length - 1) {
    multiplier = tiposDeTaco.length;
  }
  return d > 1000 * multiplier ? '#003380' :
    d > 500 * multiplier ? '#0b4aa8' :
      d > 200 * multiplier ? '#0c55b4' :
        d > 100 * multiplier ? '#1365d1' :
          d > 50 * multiplier ? '#1b84da' :
            d > 20 * multiplier ? '#389cee' :
              d > 10 * multiplier ? '#68b7f7' :
                '#8ad4ff';
}

function transformarFecha(fecha) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const partes = fecha.split("-");
  const año = partes[0];
  const mes = meses[parseInt(partes[1], 10) - 1];
  const día = partes[2];

  return `${día} de ${mes} del ${año}`;
}

let selectedType = tiposDeTaco.length - 1;
let selectedDay = "2023-07-03";

const dayText = document.getElementById("dayText");
dayText.innerText = transformarFecha(selectedDay);
const typeText = document.getElementById("typeText");
typeText.innerText = tiposDeTaco[selectedType];

const myForm = document.getElementById("myForm");
myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(myForm);
  const jsonData = Object.fromEntries(formData.entries());

  selectedType = parseInt(jsonData.type);
  selectedDay = jsonData.day;

  if (!mexicoStates[0].properties[selectedDay]) {
    for (let i = 0; i < mexicoStates.length; i++) {
      const tacosObj = {};
      let suma = 0;
      const weight = Math.random() * 1.2;
      for (let j = 0; j < tiposDeTaco.length; j++) {
        if (tiposDeTaco[j] !== "Total") {
          const randomTacos = getRandomInRange(1500) * weight;
          tacosObj[tiposDeTaco[j].replace(" ", "_").toLowerCase()] = randomTacos;
          suma += randomTacos;
        }
      }
      tacosObj.total = suma;
      mexicoStates[i].properties[selectedDay] = tacosObj;
    }

  }

  geoJSON = L.geoJSON(mexicoStates, {
    style: style,
    onEachFeature: featureOptions
  }).addTo(map);
});

function style(feature) {
  return {
    fillColor: getColor(feature.properties[selectedDay][tiposDeTaco[selectedType].replace(" ", "_").toLowerCase()]), // Color de relleno (rojo en este caso)
    weight: 1,
    opacity: 1,
    color: 'white', // Color de la línea
    dashArray: '1',
    fillOpacity: 0.7
  };
}

function styleOnHover(feature) {
  return {
    fillColor: getColor(feature.properties[selectedDay][tiposDeTaco[selectedType].replace(" ", "_").toLowerCase()]), // Color de relleno (rojo en este caso)
    weight: 2,
    opacity: 1,
    color: 'white', // Color de la línea
    dashArray: '1',
    fillOpacity: 1
  };
}

function onHover(e) {
  const layer = e.target;
  layer.setStyle(styleOnHover(layer.feature));
}

function resetHighlight(e) {
  geoJSON.resetStyle(e.target);
}

function featureOptions(feature, layer) {
  const tipo = tiposDeTaco[selectedType] === "Total" ? "" : tiposDeTaco[selectedType];
  const number = Math.round(feature.properties[selectedDay][tiposDeTaco[selectedType].replace(" ", "_").toLowerCase()]);
  const toolTipContent = `<h4>${feature.properties.name}</h4><p>Tacos ${tipo} consumidos: <strong>${number}</strong> <br> Ventas totales: <strong>$${number * costoDeTaco[selectedType]}MXN</strong></p>`;
  layer.bindTooltip(toolTipContent, {
    permanent: false,
    direction: "top",
    className: "state-tooltip",
    offset: [0, -30]
  });

  layer.on({
    mouseover: onHover,
    mouseout: resetHighlight
  })
}

const tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

const map = L.map('map',
  {
    zoomControl: true,
    layers: [tileLayer],
    maxZoom: 18,
    minZoom: 1
  }).setView([24, -103], 4);

let geoJSON = L.geoJSON(mexicoStates, {
  style: style,
  onEachFeature: featureOptions
}).addTo(map);


// setTimeout(function () { map.invalidateSize() }, 800);