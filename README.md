# BlakBox — Real-Time Log Monitoring & Alerting System

A full-stack **real-time log monitoring dashboard** built with **React.js**, **Spring Boot**, **Kafka**, **Elasticsearch**, and **Redis**.  
It provides powerful visualizations for logs, alerts, and error trends across distributed systems — simulating real-world microservice behavior.

---

## Tech Stack

### **Frontend**
- **React.js (TypeScript + MUI + Recharts)**
- Responsive dark-mode dashboard UI  
- Dynamic charts for error trends, severity distribution, and alert visualization  
- REST API integration with the Spring Boot backend  

### **Backend**
- **Spring Boot (Java)**
- RESTful APIs for log ingestion, search, and alert evaluation  
- Kafka producer for event streaming  
- Integrated with Redis and Elasticsearch
- Wrote JUnit 5 unit tests for controller and service layers using Mockito

### **Data & Messaging**
- **Apache Kafka** → Message broker for log events (`log-events` topic)  
- **Elasticsearch** → Stores and indexes all logs for search and analytics  
- **Redis** → Caches recent logs for fast dashboard rendering  

---

## System Description

BlakBox continuously ingests logs that are published to Kafka, indexed into Elasticsearch, and cached in Redis.  
These logs are then visualized on dashboard that highlights real-time application health.

> **Note:**  
> While the architecture is designed for a microservices ecosystem, the current setup uses **Python scripts to generate synthetic logs** for services.  
> This allows for realistic testing of alerting and visualization flows without deploying multiple services.

---

## Key Features

### **Dashboard Overview**
<img width="1460" height="827" alt="Dashboard" src="https://github.com/user-attachments/assets/5f07cff4-83c3-4721-a26a-842a1d53eaec" />

- Real-time metrics: total logs, recent errors, active alerts, and services  
- **Error trend graph** showing the rate of errors over time  
- **Active alerts** panel showing severity, issue type, and observed vs. threshold values  

---

### **Alerts Monitoring**
<img width="1239" height="681" alt="alerts" src="https://github.com/user-attachments/assets/cf552d7c-2017-4cb5-9810-cf29462ed25c" />


- Tracks error rates for each simulated service  
- Automatically triggers alerts when thresholds (e.g., >5 errors) are breached  
- Displays alert history and trends for the last few days  
- Visualizes alert growth patterns  

---

### **Error Analytics**
<img width="1263" height="701" alt="error trend" src="https://github.com/user-attachments/assets/7d080664-3dda-441f-b314-fa9c1ca5d92a" />


- Trend chart for total error rate across time  
- Donut chart for **severity distribution** (Error / Info / Warn)  
- Bar chart for **error count per service** — helps identify which service is failing most  

---

### **Live Logs View**
<img width="1203" height="678" alt="logs" src="https://github.com/user-attachments/assets/8771458d-2d27-47c1-a8bb-ee0bf1badfe0" />


- Displays paginated, filterable logs in real-time  
- Filter by service name, log level, environment, or trace ID  
- Color-coded severity levels
- Instant access to latest cached logs via Redis  



