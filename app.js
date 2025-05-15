let map, marker;
let savedLocation = JSON.parse(localStorage.getItem('location')) || { city: 'Melbourne', country: 'Australia' };
const { jsPDF } = window.jspdf;

// Multilingual Support
const translations = {
  en: {
    header: 'Emergency AI Assistant',
    subheader: 'Your trusted companion for real-time emergency alerts and preparedness',
    selectLocation: 'Select Location',
    saveLocation: 'Save',
    autoDetect: 'Auto-Detect Location',
    weatherAlerts: 'Weather Alerts',
    weatherForecast: 'Weather Forecast',
    recommendations: 'Recommendations',
    firstAid: 'First Aid Tips',
    resources: 'Resource Finder',
    emergencyNews: 'Emergency News',
    chat: 'AI Chat',
    shareLocation: 'Share Location',
    loading: 'Loading...',
    send: 'Send',
    emergencyContacts: 'Emergency Contacts',
    emergencyChecklist: 'Emergency Kit Checklist',
    emergencyProcedures: 'Emergency Procedures',
    addContact: 'Add Contact'
  },
  es: {
    header: 'Asistente de Emergencia IA',
    subheader: 'Tu compañero confiable para alertas de emergencia en tiempo real y preparación',
    selectLocation: 'Seleccionar Ubicación',
    saveLocation: 'Guardar',
    autoDetect: 'Detectar Ubicación Automáticamente',
    weatherAlerts: 'Alertas Meteorológicas',
    weatherForecast: 'Pronóstico del Tiempo',
    recommendations: 'Recomendaciones',
    firstAid: 'Consejos de Primeros Auxilios',
    resources: 'Buscador de Recursos',
    emergencyNews: 'Noticias de Emergencia',
    chat: 'Chat IA',
    shareLocation: 'Compartir Ubicación',
    loading: 'Cargando...',
    send: 'Enviar',
    emergencyContacts: 'Contactos de Emergencia',
    emergencyChecklist: 'Lista de Verificación del Kit de Emergencia',
    emergencyProcedures: 'Procedimientos de Emergencia',
    addContact: 'Agregar Contacto'
  },
  hi: {
    header: 'आपातकालीन AI सहायक',
    subheader: 'वास्तविक समय आपातकालीन अलर्ट और तैयारी के लिए आपका विश्वसनीय साथी',
    selectLocation: 'स्थान चुनें',
    saveLocation: 'सहेजें',
    autoDetect: 'स्थान स्वचालित रूप से पता करें',
    weatherAlerts: 'मौसम अलर्ट',
    weatherForecast: 'मौसम पूर्वानुमान',
    recommendations: 'सिफारिशें',
    firstAid: 'प्राथमिक चिकित्सा युक्तियाँ',
    resources: 'संसाधन खोजक',
    emergencyNews: 'आपातकालीन समाचार',
    chat: 'AI चैट',
    shareLocation: 'स्थान साझा करें',
    loading: 'लोड हो रहा है...',
    send: 'भेजें',
    emergencyContacts: 'आपातकालीन संपर्क',
    emergencyChecklist: 'आपातकालीन किट चेकलिस्ट',
    emergencyProcedures: 'आपातकालीन प्रक्रियाएँ',
    addContact: 'संपर्क जोड़ें'
  }
};

function updateLanguage() {
  const lang = document.getElementById('language').value;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[lang][key] || el.textContent;
  });
}

// Geolocation Auto-Detect
async function autoDetectLocation() {
  const formError = document.getElementById('formError');
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        document.getElementById('city').value = data.address.city || data.address.town || 'Unknown';
        document.getElementById('country').value = data.address.country || 'Unknown';
        savedLocation = { city: data.address.city || 'Melbourne', country: data.address.country || 'Australia' };
        localStorage.setItem('location', JSON.stringify(savedLocation));
        await saveLocationToServer(savedLocation.city, savedLocation.country); // Save to MongoDB
        formError.classList.add('hidden');
        alert('Location detected!');
      }, err => {
        throw new Error('Geolocation failed: ' + err.message);
      });
    } else {
      const response = await fetch('http://ip-api.com/json');
      const data = await response.json();
      document.getElementById('city').value = data.city || 'Melbourne';
      document.getElementById('country').value = data.country || 'Australia';
      savedLocation = { city: data.city || 'Melbourne', country: data.country || 'Australia' };
      localStorage.setItem('location', JSON.stringify(savedLocation));
      await saveLocationToServer(savedLocation.city, savedLocation.country); // Save to MongoDB
      formError.classList.add('hidden');
      alert('Location detected via IP!');
    }
  } catch (err) {
    formError.textContent = err.message;
    formError.classList.remove('hidden');
  }
}

// Initialize Map
function initMap(lat = -37.8136, lon = 144.9631) {
  map = L.map('map').setView([lat, lon], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  marker = L.marker([lat, lon]).addTo(map).bindPopup('Your Location');
  L.marker([lat + 0.01, lon + 0.01]).addTo(map).bindPopup('Shelter: City Center');
  L.marker([lat - 0.01, lon - 0.01]).addTo(map).bindPopup('Hospital: General Hospital');
  L.marker([lat + 0.02, lon + 0.02]).addTo(map).bindPopup('Pharmacy: Main St');
}

// Update Map
function updateMap(lat, lon, city) {
  map.setView([lat, lon], 12);
  marker.setLatLng([lat, lon]);
  marker.bindPopup(`<b>${city}</b>`).openPopup();
}

// Alert Banner
function showAlertBanner(message) {
  const banner = document.getElementById('alertBanner');
  const alertMessage = document.getElementById('alertMessage');
  alertMessage.textContent = message;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('animate-shake'), 100);
}

function closeAlertBanner() {
  document.getElementById('alertBanner').classList.add('hidden');
}

// Emergency Modal
function showModal(message) {
  const modal = document.getElementById('emergencyModal');
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.textContent = message;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('emergencyModal').classList.add('hidden');
}

// Share Location
function shareLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation not supported.');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const shareUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Location link copied to clipboard: ' + shareUrl);
      showModal('Location link copied! Share it with your contacts.');
    }).catch(err => {
      alert('Failed to copy link: ' + err.message);
    });
  });
}

// AI Chat
const chatResponses = {
  'earthquake': 'Drop, cover, and hold on during shaking.',
  'shelter': 'Nearest shelter: City Center (check map).',
  'hospital': 'Nearest hospital: General Hospital (check map).'
};

function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  const contentElements = [
    document.getElementById('map'),
    document.getElementById('data'),
    document.getElementById('contactsBox'),
    document.getElementById('checklistBox'),
    document.getElementById('proceduresBox')
  ];
  contentElements.forEach(el => el.classList.add('hidden'));
  chatBox.classList.toggle('hidden');
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const query = input.value.toLowerCase();
  messages.innerHTML += `<p class="bg-gray-100 p-2 rounded"><strong>You:</strong> ${input.value}</p>`;
  const response = Object.keys(chatResponses).find(key => query.includes(key)) ? chatResponses[Object.keys(chatResponses).find(key => query.includes(key))] : 'Try asking about shelters or disasters.';
  messages.innerHTML += `<p class="bg-red-100 p-2 rounded"><strong>AI:</strong> ${response}</p>`;
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
}

// Emergency Contacts
function toggleContacts() {
  const contactsBox = document.getElementById('contactsBox');
  const contentElements = [
    document.getElementById('chatBox'),
    document.getElementById('map'),
    document.getElementById('data'),
    document.getElementById('checklistBox'),
    document.getElementById('proceduresBox')
  ];
  contentElements.forEach(el => el.classList.add('hidden'));
  contactsBox.classList.toggle('hidden');
  if (!contactsBox.classList.contains('hidden')) {
    loadContacts();
  }
}

function loadContacts() {
  const contactList = document.getElementById('contactList');
  const contacts = JSON.parse(localStorage.getItem('emergencyContacts')) || [];
  contactList.innerHTML = contacts.length ? 
    contacts.map((contact, index) => `
      <li class="flex justify-between items-center p-2 bg-gray-100 rounded">
        <span>${contact.name}: ${contact.phone}</span>
        <button onclick="deleteContact(${index})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
      </li>
    `).join('') : 
    '<p class="text-gray-500">No contacts saved.</p>';
}

function saveContact(name, phone) {
  const contacts = JSON.parse(localStorage.getItem('emergencyContacts')) || [];
  contacts.push({ name, phone });
  localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
  loadContacts();
}

function deleteContact(index) {
  const contacts = JSON.parse(localStorage.getItem('emergencyContacts')) || [];
  contacts.splice(index, 1);
  localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
  loadContacts();
}

// Emergency Kit Checklist
const defaultChecklist = [
  { item: 'Bottled Water (3L/person/day)', checked: false },
  { item: 'Non-perishable Food (3 days)', checked: false },
  { item: 'Flashlight and Batteries', checked: false },
  { item: 'First-Aid Kit', checked: false },
  { item: 'Blankets', checked: false },
  { item: 'Multi-tool', checked: false }
];

function toggleChecklist() {
  const checklistBox = document.getElementById('checklistBox');
  const contentElements = [
    document.getElementById('chatBox'),
    document.getElementById('map'),
    document.getElementById('data'),
    document.getElementById('contactsBox'),
    document.getElementById('proceduresBox')
  ];
  contentElements.forEach(el => el.classList.add('hidden'));
  checklistBox.classList.toggle('hidden');
  if (!checklistBox.classList.contains('hidden')) {
    loadChecklist();
  }
}

function loadChecklist() {
  const checklistItems = document.getElementById('checklistItems');
  let checklist = JSON.parse(localStorage.getItem('emergencyChecklist')) || defaultChecklist;
  checklistItems.innerHTML = checklist.map((item, index) => `
    <li class="flex items-center p-2 bg-gray-100 rounded">
      <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleChecklistItem(${index})" class="mr-2">
      <span class="${item.checked ? 'line-through text-gray-500' : ''}">${item.item}</span>
    </li>
  `).join('');
}

function toggleChecklistItem(index) {
  let checklist = JSON.parse(localStorage.getItem('emergencyChecklist')) || defaultChecklist;
  checklist[index].checked = !checklist[index].checked;
  localStorage.setItem('emergencyChecklist', JSON.stringify(checklist));
  loadChecklist();
}

// Emergency Procedures Guide
const emergencyProcedures = [
  { type: 'Earthquake', steps: ['Drop, cover, and hold on.', 'Stay away from windows.', 'After shaking stops, evacuate if needed.'] },
  { type: 'Fire', steps: ['Evacuate immediately.', 'Stay low to avoid smoke.', 'Call emergency services once safe.'] },
  { type: 'Flood', steps: ['Move to higher ground.', 'Avoid walking through floodwater.', 'Listen to local alerts.'] }
];

function toggleProcedures() {
  const proceduresBox = document.getElementById('proceduresBox');
  const contentElements = [
    document.getElementById('chatBox'),
    document.getElementById('map'),
    document.getElementById('data'),
    document.getElementById('contactsBox'),
    document.getElementById('checklistBox')
  ];
  contentElements.forEach(el => el.classList.add('hidden'));
  proceduresBox.classList.toggle('hidden');
  if (!proceduresBox.classList.contains('hidden')) {
    loadProcedures();
  }
}

function loadProcedures() {
  const proceduresList = document.getElementById('proceduresList');
  proceduresList.innerHTML = emergencyProcedures.map(proc => `
    <li class="p-2 bg-gray-100 rounded">
      <strong>${proc.type}:</strong>
      <ul class="list-disc pl-5 mt-1">
        ${proc.steps.map(step => `<li>${step}</li>`).join('')}
      </ul>
    </li>
  `).join('');
}

// Save Location
async function saveLocationToServer(city, country) {
  try {
    const response = await fetch('/save-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, country }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to save location to server.');
    }
    console.log(result.message);
  } catch (err) {
    console.error('Error saving location to server:', err.message);
  }
}

function saveLocation() {
  document.getElementById('locationForm').addEventListener('submit', async e => {
    e.preventDefault();
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim() || '';
    const formError = document.getElementById('formError');

    if (!city) {
      formError.textContent = 'Please enter a city.';
      formError.classList.remove('hidden');
      return;
    }

    savedLocation = { city, country };
    localStorage.setItem('location', JSON.stringify(savedLocation));
    await saveLocationToServer(city, country); // Save to MongoDB
    formError.classList.add('hidden');
    alert(`Location saved: ${city}${country ? ', ' + country : ''}`);
  });
}

// Fetch Data
async function fetchData(endpoint) {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const dataDiv = document.getElementById('data');
  const mapDiv = document.getElementById('map');
  const chatBox = document.getElementById('chatBox');
  const contactsBox = document.getElementById('contactsBox');
  const checklistBox = document.getElementById('checklistBox');
  const proceduresBox = document.getElementById('proceduresBox');

  loading.classList.remove('hidden');
  error.classList.add('hidden');
  dataDiv.classList.add('hidden');
  mapDiv.classList.add('hidden');
  chatBox.classList.add('hidden');
  contactsBox.classList.add('hidden');
  checklistBox.classList.add('hidden');
  proceduresBox.classList.add('hidden');
  dataDiv.innerHTML = '';

  try {
    const query = `?city=${encodeURIComponent(savedLocation.city)}${savedLocation.country ? '&country=' + encodeURIComponent(savedLocation.country) : ''}`;
    const response = await fetch(endpoint + query);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (endpoint.includes('/alerts')) {
      mapDiv.classList.remove('hidden');
      if (!map) initMap(data.lat, data.lon);
      else updateMap(data.lat, data.lon, data.city);
      dataDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 card">
          <h2 class="text-2xl font-semibold flex items-center"><i class="fas fa-cloud-shower-heavy mr-2 text-red-500"></i> Weather Alerts for ${data.city}</h2>
          <p><strong>Condition:</strong> ${data.condition}</p>
          <p><strong>Temperature:</strong> ${data.temperature}</p>
          <p><strong>Humidity:</strong> ${data.humidity}</p>
          <p><strong>Wind Speed:</strong> ${data.windSpeed}</p>
          <p class="text-red-600 font-bold">${data.alert}</p>
        </div>
      `;
      if (data.alert.includes('warning')) {
        showAlertBanner(data.alert);
        showModal(data.alert);
      }
    } else if (endpoint.includes('/forecast')) {
      dataDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 card">
          <h2 class="text-2xl font-semibold flex items-center"><i class="fas fa-sun mr-2 text-yellow-500"></i> 3-Day Weather Forecast for ${data.city}</h2>
          <div class="space-y-4">
            ${data.forecast.map(day => `
              <div class="border p-4 rounded">
                <h3 class="font-semibold">${day.date}</h3>
                <p><strong>Condition:</strong> ${day.condition}</p>
                <p><strong>Max Temp:</strong> ${day.maxTemp}</p>
                <p><strong>Min Temp:</strong> ${day.minTemp}</p>
                <p><strong>Chance of Rain:</strong> ${day.chanceOfRain}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (endpoint.includes('/recommendations')) {
      mapDiv.classList.remove('hidden');
      if (!map) initMap(data.lat, data.lon);
      else updateMap(data.lat, data.lon, data.city);
      dataDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 card">
          <h2 class="text-2xl font-semibold flex items-center"><i class="fas fa-lightbulb mr-2 text-green-500"></i> Recommendations for ${data.city}</h2>
          <ul class="list-disc pl-5">
            ${data.recommendations.map(rec => `<li>${rec.message}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (endpoint.includes('/first-aid')) {
      dataDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 card">
          <h2 class="text-2xl font-semibold flex items-center"><i class="fas fa-first-aid mr-2 text-red-500"></i> First Aid Tips</h2>
          <ul class="list-disc pl-5">
            ${data.tips.map(tip => `<li>${tip.message}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (endpoint.includes('/resources')) {
      mapDiv.classList.remove('hidden');
      if (!map) initMap(data.lat, data.lon);
      else updateMap(data.lat, data.lon, data.city);
      dataDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 card">
          <h2 class="text-2xl font-semibold flex items-center"><i class="fas fa-hospital mr-2 text-teal-500"></i> Resource Finder</h2>
          <ul class="list-disc pl-5">
            ${data.resources.map(res => `<li>${res.type}: ${res.status}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (endpoint.includes('/news')) {
      dataDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 card">
          <h2 class="text-2xl font-semibold flex items-center"><i class="fas fa-newspaper mr-2 text-purple-500"></i> Emergency News</h2>
          <div class="space-y-4">
            ${data.articles ? data.articles.map(article => `
              <div class="border p-4 rounded">
                <h3 class="font-semibold">${article.title}</h3>
                <p>${article.description}</p>
                <a href="${article.url}" target="_blank" class="text-blue-500 hover:underline">Read more</a>
              </div>
            `).join('') : `<p class="text-red-500">${data.error}</p>`}
          </div>
        </div>
      `;
    }

    dataDiv.classList.remove('hidden');
  } catch (err) {
    error.textContent = `Error: ${err.message}`;
    error.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

// Display Current Date and Time
function displayDateTime() {
  const dateTimeElement = document.getElementById('currentDateTime');
  if (dateTimeElement) {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Australia/Sydney',
      timeZoneName: 'short'
    };
    dateTimeElement.textContent = now.toLocaleString('en-AU', options); // e.g., "Thursday, 15 May 2025, 08:05 PM AEST"
  }
}

// Initialize
function initialize() {
  document.getElementById('city').value = savedLocation.city;
  document.getElementById('country').value = savedLocation.country;
  document.getElementById('language').addEventListener('change', updateLanguage);
  updateLanguage();
  saveLocation();
  if (!localStorage.getItem('emergencyChecklist')) {
    localStorage.setItem('emergencyChecklist', JSON.stringify(defaultChecklist));
  }
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registered');
    }).catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  }
  // Add contact form listener
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    if (name && phone) {
      saveContact(name, phone);
      document.getElementById('contactName').value = '';
      document.getElementById('contactPhone').value = '';
    }
  });
  // Display and update date/time
  displayDateTime();
  setInterval(displayDateTime, 60000); // Update every minute
}

// Run initialization
initialize();