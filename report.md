# SIT323/SIT737 Task 10.2HD: Cloud-Native Application Development Report  
**Srilakshmi**  
May 2025  

---

## 1. Overview

This report outlines the development, containerization, and deployment process for the Emergency AI Assistant, a cloud-native web application built using Node.js. The application is containerized with Docker and deployed on Google Cloud Platform (GCP) using Kubernetes. It provides real-time emergency-related features, such as weather alerts, forecasts, and safety recommendations, to support users in critical situations.

---

## 2. Steps Taken

### 2.1 Step 4: Push Docker Image to Google Artifact Registry (GAR)

**Tools Used:** Docker, Google Cloud SDK  

**Details:**  
- Built and tagged the Docker image using the command:  
  ```bash
  docker build -t gcr.io/sit737-25t1-nair-a46d95f/emergency-ai-assistant:latest .
Attempted to push the image to gcr.io, but encountered a region policy violation due to restrictions on the US region.

Retagged the image to use australia-southeast1-docker.pkg.dev to comply with regional policies.

Created a Google Artifact Registry (GAR) repository named emergency-ai-assistant via the GCP Console.

Successfully pushed the image using:

bash
Copy
Edit
docker push australia-southeast1-docker.pkg.dev/...
Analyzed the Docker image for vulnerabilities using docker scout quickview and applied recommendations, such as updating the base image to address identified issues.

3. Challenges Encountered
MongoDB in Production:
The MONGO_URI in deployment.yaml references a local MongoDB instance (mongodb://mongo:27017/emergency-ai), which is inaccessible in Google Kubernetes Engine (GKE).
A managed MongoDB service, such as MongoDB Atlas, is recommended for production but was not implemented due to complexity and budget constraints.
Workaround: The application remains functional, but the /save-location endpoint will fail in production until a proper MongoDB instance is configured.

Budget Constraints:
To stay within the $200 budget, the GKE cluster was configured with cost-effective options, using e2-medium machine types and a 2-node cluster.

Learning Curve:
As a beginner, grasping Kubernetes concepts like Deployments and Services was challenging. Google Cloud Skills Boost tutorials were used to build foundational knowledge.

API Enablement Issue (Resolved):
Encountered a PERMISSION_DENIED error due to a typo in the API endpoint (logging.googleapis.co instead of logging.googleapis.com).
Corrected the typo and verified that all required APIs were enabled.

GCR Region Policy Violation:
Pushing to gcr.io failed due to a policy restricting the US region. Resolved by retagging the image to use australia-southeast1-docker.pkg.dev.

GAR Repository Not Found:
Encountered an error when pushing to GAR because the emergency-ai-assistant repository did not exist. Resolved by manually creating the repository in the GCP Console.

4. Tools and Configurations Used
Docker Scout:
Used to identify and mitigate vulnerabilities in the Docker image, ensuring a secure container for deployment.

GCP Services:

Google Artifact Registry (GAR): Utilized australia-southeast1-docker.pkg.dev for storing the Docker image, ensuring compliance with regional policies.

5. Conclusion
The Emergency AI Assistant was successfully containerized using Docker and prepared for deployment on GCP using Kubernetes. Challenges such as MongoDB configuration, budget constraints, and initial issues with region policies and API enablement were addressed through workarounds and learning resources like Google Cloud Skills Boost tutorials. The Docker image was securely pushed to GAR, positioning the application for further configuration to achieve full functionality in a production environment.


