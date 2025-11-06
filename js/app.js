$(document).on("pagecreate", "#home", function() {

    console.log("Aplicación iniciada.");

    // Inicializar mapa Leaflet
    const map = L.map('map').setView([0, 0], 2);

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Mensaje inicial
    $("#weather-info").html("<p>Obteniendo tu ubicación actual...</p>");

    // ====== GEOLOCALIZACIÓN ======
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                console.log(`Latitud detectada: ${lat}, Longitud detectada: ${lon}`);

                // Centrar mapa
                map.setView([lat, lon], 13);
                L.marker([lat, lon]).addTo(map).bindPopup("Tu ubicación actual").openPopup();
                map.invalidateSize();

                // Añadir marcador
                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup("Tu ubicación actual")
                    .openPopup();

                // Actualizar mensaje en pantalla
                $("#weather-info").html(`
                    <p><strong>Ubicación detectada.</strong></p>
                    <p>Latitud: ${lat.toFixed(4)}, Longitud: ${lon.toFixed(4)}</p>
                    <p>Puedes buscar otra ciudad en el campo superior.</p>
                `);
            },
            function(error) {
                console.warn("Error al obtener ubicación:", error);
                let msg = "";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "Permiso denegado. Usa el buscador para seleccionar una ciudad.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Información de ubicación no disponible.";
                        break;
                    case error.TIMEOUT:
                        msg = "Tiempo de espera agotado al intentar obtener la ubicación.";
                        break;
                    default:
                        msg = "Error desconocido al obtener la ubicación.";
                }
                $("#weather-info").html(`<p style="color:red;">${msg}</p>`);
                map.setView([0, 0], 2);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        $("#weather-info").html("<p style='color:red;'>La geolocalización no es compatible con tu navegador.</p>");
        map.setView([0, 0], 2);
    }

    // Evento para buscar una ciudad
    $("#searchCity").on("click", function () {
        const city = $("#city").val().trim();
        if (city === "") {
            alert("Por favor, ingresa el nombre de una ciudad.");
            return;
        }

        // URL de geocodificación (convertir nombre -> coordenadas)
        const urlGeo = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;

        $.getJSON(urlGeo, function (data) {
            if (data && data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;

                // Centrar mapa y agregar marcador
                map.setView([lat, lon], 13);
                L.marker([lat, lon]).addTo(map).bindPopup(city).openPopup();

                // Mostrar coordenadas
                $("#weather-info").html(`
                    <p><strong>Ciudad:</strong> ${city}</p>
                    <p><strong>Latitud:</strong> ${parseFloat(lat).toFixed(4)} | <strong>Longitud:</strong> ${parseFloat(lon).toFixed(4)}</p>
                `);

                // --- Obtener clima actual ---
                const apiKey = "0d8942c895b33ac7248f9b4668eca381";
                const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;

                $.getJSON(weatherURL, function(weatherData) {
                const temp = weatherData.main.temp;
                const condition = weatherData.weather[0].description;
                const humidity = weatherData.main.humidity;
                const wind = weatherData.wind.speed;

                $("#weather-info").html(`
                    <h3>Clima en ${city}</h3>
                    <p><strong>Temperatura:</strong> ${temp.toFixed(1)} °C</p>
                    <p><strong>Condición:</strong> ${condition}</p>
                    <p><strong>Humedad:</strong> ${humidity}%</p>
                    <p><strong>Viento:</strong> ${wind} m/s</p>
                `);
                }).fail(function() {
                $("#weather-info").html("<p style='color:red;'>Error al obtener datos del clima.</p>");
                });
            } else {
            alert("No se encontró la ciudad.");
            }
        });
    });
});

