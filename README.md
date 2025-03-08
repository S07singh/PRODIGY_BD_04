# 🚀 Implementing Caching with Redis in REST API  

A **high-performance Node.js API** optimized using **Redis caching** to reduce database load and improve response times.  

## 📸 Project Screenshots 
![Image](https://github.com/user-attachments/assets/05d966a4-9f1c-4ba4-ac0d-e98a5abffd25)


## ⭐ Features  

- ⚡ **Redis Integration**  
  - Cached API responses for frequently accessed data (e.g., fetching all users)  
  - Cache expiration to ensure fresh data  
  - Implemented cache invalidation for updates/deletes  

- 🛠 **Performance Optimization**  
  - Measured API response times **before and after caching**  
  - Reduced database queries with **in-memory caching**  

- 🔐 **Secure & Scalable**  
  - Used **environment variables** for Redis configuration  
  - Optimized for **scalability and high availability**
 
  
## 🔌 API Endpoints  

### User Management  
- `GET /api/users` → Fetch all users **(Cached)**  
- `GET /api/users/:id` → Fetch single user (Non-Cached)  
- `POST /api/users` → Create a new user  
- `PATCH /api/users/:id` → Update a user **(Invalidates Cache)**  
- `DELETE /api/users/:id` → Delete a user **(Invalidates Cache)**  

## 🚀 Getting Started  

### Prerequisites  
- **Node.js** (v14 or higher)  
- **Redis** installed and running  

### Installation  

1. Clone the repository  
   ```bash
   git clone https://github.com/S07singh/PRODIGY_BD_04.git
   cd redis-caching-api

