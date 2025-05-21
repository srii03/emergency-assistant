# Emergency AI Assistant

Emergency AI Assistant is a cloud-native, full-stack web application designed to provide users with real-time emergency alerts and actionable information during natural disasters and critical situations. The application uses AI and integrates multiple data sources to deliver accurate, location-based updates, safety recommendations, and emergency resources. It helps individuals and communities stay informed, prepared, and safe.

---

## Features

- 🚨 **Emergency Alerts:** Timely notifications about natural disasters like floods, bushfires, storms, earthquakes, and other emergencies, based on your location or auto-detected position.  
- 🌤️ **Weather Forecast:** Detailed 3-day weather outlook including temperature, rain chances, wind speed, and warnings to help plan ahead.  
- 💡 **Recommendations:** AI-powered safety tips and preparedness advice tailored to your current location and type of emergency, including evacuation routes and shelter info.  
- 🩹 **First Aid Tips:** Easy-to-follow first aid instructions for various injuries and medical emergencies to assist before professional help arrives.  
- 🗺️ **Resource Finder:** Find nearby emergency shelters, hospitals, pharmacies, and supply centers on an interactive map.  
- 📰 **Emergency News:** Latest news updates related to ongoing emergency events from trusted sources.  
- 📞 **Emergency Contacts:** Save and manage important contacts such as family, friends, local emergency services, and community groups for quick access during crises.  
- ✅ **Emergency Kit Checklist:** Maintain a personalized checklist of essential items for your emergency preparedness kit.  
- 📋 **Emergency Procedures:** Step-by-step guides and protocols for different emergency types (fire, flood, earthquake, etc.) to respond effectively.  
- 🤖 **AI Chat:** Chat with an AI assistant to get answers, guidance, and personalized emergency support based on real-time data.  
- 📍 **Share Location:** Share your live location with trusted contacts to enable quick help or rescue.

---

## System Architecture

- **Frontend:** Static web app providing interactive UI components for alerts, maps, checklists, and AI chat.  
- **Backend:** Node.js REST API managing data aggregation, user interactions, AI chat logic, and connecting with external APIs.  
- **Database:** MongoDB stores user profiles, contacts, emergency kit info, and cached data.  
- **Containerization:** Docker packages the application into portable containers.  
- **Orchestration:** Kubernetes manages container deployment, scaling, and networking on Google Kubernetes Engine (GKE).  
- **Monitoring:** Google Cloud Monitoring and Logging provide real-time performance and health tracking.

---

## Technologies Used

- **Backend Framework:** Node.js with Express.js  
- **Frontend:** HTML5, CSS3, JavaScript  
- **Database:** MongoDB (NoSQL)  
- **Containerization:** Docker  
- **Container Orchestration:** Kubernetes (GKE on Google Cloud)  
- **Cloud Provider:** Google Cloud Platform (GCP)  
- **Weather Data API:** OpenWeather API  
- **News Data API:** NewsAPI  
- **AI Chat:** OpenAI API (or custom NLP module)  
- **Monitoring & Logging:** Google Cloud Monitoring and Logging  

---

## Deployment Details

- The app is containerized using Docker for consistent environments.  
- Kubernetes YAML files define deployments, services, and ingress rules.  
- Google Cloud Load Balancer distributes traffic to ensure high availability.  
- Persistent storage is configured for MongoDB data durability.  
- Sensitive data like API keys and credentials are managed securely with Kubernetes Secrets.

---

## Running Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/srii03/emergency-assistant.git
   cd emergency-assistant
Install dependencies:


npm install
Create a .env file in the root directory with the following content:

ini

PORT=8080
MONGODB_URI=your_mongodb_connection_string
OPENWEATHER_API_KEY=your_openweather_api_key
NEWSAPI_KEY=your_newsapi_key
Start the application:

npm start
Open your browser at http://localhost:8080

Deploying on Kubernetes (GKE)
Build the Docker image:

docker build -t gcr.io/[PROJECT-ID]/emergency-ai-assistant:latest .
Push the image to Google Container Registry:


docker push gcr.io/[PROJECT-ID]/emergency-ai-assistant:latest
Deploy to Kubernetes:


kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
Access the app using the external IP of the LoadBalancer service.

Monitoring & Logging
Utilizes Google Cloud Monitoring for metrics, health checks, and alerts.

Logs aggregated via Google Cloud Logging for debugging and audits.

Plans to add Prometheus and Grafana for advanced monitoring dashboards.

Security Practices
Network security enforced with Kubernetes Network Policies.

Role-Based Access Control (RBAC) restricts permissions in Kubernetes.

Sensitive data stored securely as Kubernetes Secrets.

All data in transit encrypted with HTTPS/TLS.

Docker images scanned for vulnerabilities before deployment.

Future Enhancements
Multilingual support for wider accessibility.

Improved AI chatbot with natural language understanding and voice capabilities.

Progressive Web App (PWA) features for offline use.

Integration with additional emergency services and government APIs.

User authentication and personalized emergency planning.

Contributing
Contributions are welcome! Please fork the repository and submit pull requests. For major changes, open an issue first to discuss.

License
This project is licensed under the MIT License.

Contact
Created by Sri
GitHub: srii03

For questions or support, please open an issue on GitHub.

Stay safe and prepared with Emergency AI Assistant!
