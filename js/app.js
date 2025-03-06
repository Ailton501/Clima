// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.error('Error registrando el Service Worker:', error);
            });
    });
}

// Cambiar el fondo de video al cargar la página (sin necesidad de buscar una ciudad)
window.addEventListener('load', function() {
    // Simulamos un clima predeterminado, puedes cambiarlo si quieres usar otro
    const climaPredeterminado = 'Clear';  // Por ejemplo, clima despejado
    cambiarFondoPorClima(climaPredeterminado); // Cambiar fondo según el clima
});

// Evento para el botón de búsqueda
document.getElementById('btn').addEventListener('click', function () {
    const ciudad = document.getElementById('caja').value.trim(); // Eliminar espacios en blanco
    const mensajeError = document.getElementById('mensaje-error');

    if (ciudad === "") {
        // Mostrar mensaje de error si el campo está vacío
        mensajeError.style.display = "block";
    } else {
        // Ocultar mensaje de error y realizar la búsqueda
        mensajeError.style.display = "none";
        obtenerPronostico(ciudad);
    }
});

// Función para obtener el pronóstico del tiempo
async function obtenerPronostico(ciudad) {
    const apikey = '51a6bc48d4fddded3c865286cd6f3eee';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apikey}&units=metric&lang=es`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ciudad no encontrada, solicitud fallida');
        }
        const data = await response.json();
        mostrarPronostico(data);
    } catch (error) {
        console.error("Error al obtener el pronóstico", error);
        mostrarError();
    }
}

// Función para mostrar el pronóstico del tiempo
function mostrarPronostico(data) {
    const climaActual = document.getElementById('clima-actual');
    const pronosticoClima = document.getElementById('pronostico-clima');
    const videoFondo = document.getElementById('video-fondo-source');

    // Limpiar contenido previo
    climaActual.innerHTML = '';
    pronosticoClima.innerHTML = '';

    // Obtener el clima actual
    const actual = data.list[0];
    const iconoActual = obtenerIcono(actual.weather[0].main);

    // Cambiar video de fondo según el clima
    cambiarFondoPorClima(actual.weather[0].main);

    climaActual.innerHTML = `        
        <div class="tarjeta-clima">
            <strong>${new Date(actual.dt * 1000).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong><br>
            <img src="icons/${iconoActual}" alt="${actual.weather[0].description}"><br>
            Temperatura: ${actual.main.temp}°C<br>
            Clima: ${actual.weather[0].description}<br>
            Viento: ${actual.wind.speed} m/s<br>
            Humedad: ${actual.main.humidity}%
        </div>
    `;

    // Mostrar el pronóstico de los siguientes días
    const dias = data.list.filter((item, index) => index % 8 === 0 && index !== 0); // Cada 8 registros (24 horas), excluyendo el primero
    dias.forEach(dia => {
        const fecha = new Date(dia.dt * 1000);
        const icono = obtenerIcono(dia.weather[0].main);
        pronosticoClima.innerHTML += `        
            <div class="tarjeta-clima">
                <strong>${fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong><br>
                <img src="icons/${icono}" alt="${dia.weather[0].description}"><br>
                Temperatura: ${dia.main.temp}°C<br>
                Clima: ${dia.weather[0].description}<br>
                Viento: ${dia.wind.speed} m/s<br>
                Humedad: ${dia.main.humidity}%
            </div>
        `;
    });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('¡Notificaciones activadas!', {
                    body: 'Recibirás actualizaciones sobre el clima.',
                    icon: './icons/Nublado.png',
                });
            });
        }
    });
}


// Función para mostrar un mensaje de error
function mostrarError() {
    const climaActual = document.getElementById('clima-actual');
    const pronosticoClima = document.getElementById('pronostico-clima');

    // Limpiar contenido previo
    climaActual.innerHTML = '';
    pronosticoClima.innerHTML = '';

    // Mostrar mensaje de error
    climaActual.innerHTML = `        
        <div class="tarjeta-clima">
            <strong>La ciudad no existe, no fue encontrada ó se perdió la conexión</strong>
        </div>
    `;
}

function obtenerIcono(condicion) {
    switch(condicion) {
        case 'Thunderstorm':
            return 'Tormenta.png';
        case 'Drizzle':
            return 'Nublado.png';
        case 'Rain':
            return 'Lluvia.png';
        case 'Snow':
            return 'Nieve.png';
        case 'Clear':
            return 'Limpio.png';
        case 'Clouds':
            return 'Nublado.png';
        default:
            return 'Parcialmente-Nublado.png';
    }
}

// Función para cambiar el fondo de video según el clima
function cambiarFondoPorClima(condicion) {
    const videoFondo = document.getElementById('video-fondo');
    const videoFondoSource = document.getElementById('video-fondo-source');

    // Cambiar el video según la condición del clima
    switch (condicion) {
        case 'Clear':
            videoFondoSource.src = 'vid/despejado.mp4';
            break;
        case 'Rain':
            videoFondoSource.src = 'vid/lluvioso.mp4';
            break;
        case 'Snow':
            videoFondoSource.src = 'vid/nevado.mp4';
            break;
        case 'Clouds':
            videoFondoSource.src = 'vid/nublado.mp4';
            break;
        case 'Thunderstorm':
            videoFondoSource.src = 'vid/tormenta.mp4';
            break;
        default:
            videoFondoSource.src = 'vid/fondo.mp4'; 
            break;
    }

    // Recargar el video
    videoFondo.load();
}
