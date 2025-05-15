SIT323/SIT737 Task 10.2HD: Cloud-Native Application Development Report
Overview
This report documents the development, containerization, and deployment of the Emergency AI Assistant, a cloud-native web application built with Node.js, containerized using Docker, and deployed on Google Cloud Platform (GCP) using Kubernetes. The application provides real-time emergency-related features like weather alerts, forecasts, and safety recommendations.
Steps Taken
Step 4: Push Docker Image to Google Artifact Registry (GAR)

Tool Used: Docker, Google Cloud SDK
Details:
Built and tagged the Docker image: docker build -t gcr.io/sit737-25t1-nair-a46d95f/emergency-ai-assistant:latest .
Initially attempted to push to gcr.io, but encountered a region policy violation.
Retagged the image to use australia-southeast1-docker.pkg.dev and created a GAR repository named emergency-ai-assistant using the GCP Console.
Pushed the image: docker push australia-southeast1-docker.pkg.dev/sit737-25t1-nair-a46d95f/emergency-ai-assistant/emergency-ai-assistant:latest
Used docker scout quickview to check for vulnerabilities in the image and applied recommendations (e.g., updated base image).


Screenshot: screenshots/gar-repository.png (GAR repository creation)
Screenshot: screenshots/gar-push-success.png (Successful push output)
Screenshot: screenshots/docker-scout-vulnerabilities.png (Output of docker scout quickview)

Challenges Encountered

MongoDB in Production:
The MONGO_URI in deployment.yaml points to a local MongoDB instance (mongodb://mongo:27017/emergency-ai), which isn’t accessible in GKE. A managed MongoDB service (e.g., MongoDB Atlas) should be used in production, but this was not set up due to complexity and budget constraints.
Workaround: The app still functions, but the /save-location endpoint will fail in production until a proper MongoDB instance is configured.


Budget Constraints:
Ensured the GKE cluster used cost-effective options (e2-medium, 2 nodes) to stay within the $200 budget.


Learning Curve:
As a beginner, understanding Kubernetes concepts like Deployments and Services was challenging. Used Google Cloud Skills Boost tutorials to learn.


API Enablement Issue (Resolved):
Initially encountered a PERMISSION_DENIED error due to a typo (logging.googleapis.co instead of logging.googleapis.com). Corrected the typo and confirmed all required APIs are enabled.


GCR Region Policy Violation:
Pushing to gcr.io failed due to a policy restricting the us region. Retagged the image to use australia-southeast1-docker.pkg.dev, which resolved the issue.


GAR Repository Not Found:
Encountered an error pushing to GAR because the emergency-ai-assistant repository did not exist. Created the repository manually in the GCP Console.



Tools and Configurations Used

Docker Scout: Used to identify and address image vulnerabilities.
GCP Services:
Google Artifact Registry (GAR): Used australia-southeast1-docker.pkg.dev for image storage.



