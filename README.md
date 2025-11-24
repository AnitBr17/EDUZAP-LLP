Eduzap Requests — Full-Stack App (Backend + Frontend)

Small full-stack app for collecting and viewing requests (name, phone, title, image, timestamp).
Includes:
Backend: Node.js + Express + MongoDB + Mongoose, image upload (multer), Socket.IO real-time events, in-memory LRU cache.
Frontend: React (Vite) + Tailwind CSS, Add Request form (image upload), list view, search, sort, pagination, stats, realtime updates.
This README documents how to run and use both projects, API endpoints, folder structure, environment variables, and common notes.
Table of Contents
Features
Repo structure (overview)
Backend — Quickstart & docs
Frontend — Quickstart & docs
Environment variables (.env examples)
API endpoints & examples (curl)
Socket.IO events
Notes, troubleshooting & next steps
License

1 — Features
Create requests (name, phone, title, optional image file or image URL).
View all requests, sort A→Z, search by title, client-side pagination (5 per page).
Highlight requests added within the last 1 hour.
Request title duplicate counts (statistics).
Delete requests (removes uploaded file when applicable).
Real-time updates via Socket.IO when requests are added or deleted.
Simple LRU in-memory cache for frequently-fetched list endpoints.

2 — Repo structure (high level)
/backend
  ├─ server.js
  ├─ package.json
  ├─ .env
  ├─ /uploads                # stored uploaded images
  ├─ /config
  │    └─ db.js
  ├─ /models
  │    └─ Request.js
  ├─ /routes
  │    └─ requests.js
  └─ /utils
       └─ lruCache.js

/frontend
  ├─ index.html
  ├─ package.json
  ├─ .env (optional: VITE_API_BASE)
  ├─ tailwind.config.js
  ├─ postcss.config.js
  └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ api.js
      ├─ index.css
      ├─ utils/format.js
      └─ components/
          ├─ AddRequestForm.jsx
          ├─ RequestList.jsx
          ├─ RequestCard.jsx
          ├─ SearchBar.jsx
          └─ StatsWidget.jsx

3 — Backend — Quickstart & docs
Requirements
Node.js (v18+ recommended)
MongoDB (local or Atlas)
The server defaults to http://localhost:4000. Uploaded files are served at http://localhost:4000/uploads/<filename>.
Key files
server.js — app entry, Socket.IO setup, static serving for uploads
routes/requests.js — all endpoints, multer upload handling, cache invalidation, emits socket events
models/Request.js — Mongoose schema
utils/lruCache.js — simple in-memory LRU cache
Validation
Server enforces that name, phone, and title are non-empty. If validation fails and a file was uploaded, the server attempts to remove the file.

4 — Frontend — Quickstart & docs
Open the dev URL printed by Vite (e.g. http://localhost:5173).
Key features implemented
Add Request form that uploads image via multipart/form-data (field image).
List view with search (client-side), sort (calls /requests/sorted), pagination (5 per page), delete.
Stats widget (total requests, today's requests, duplicate title counts).
Socket.IO client for real-time updates.

5 — Environment variables (examples)
Backend .env
PORT=4000
MONGO_URI=mongodb://localhost:27017/eduzap
UPLOAD_DIR=uploads
Frontend .env (optional)
VITE_API_BASE=http://localhost:4000
If VITE_API_BASE is not set, frontend defaults to http://localhost:4000.

6 — API endpoints & examples
Base: http://localhost:4000
POST /request
Create a request. Accepts multipart/form-data (for file upload) or JSON with image URL.
Fields:
name (string, required)
phone (string, required)
title (string, required)
image (file, optional) OR image (string URL, optional)
curl (multipart):
curl -X POST http://localhost:4000/request \
  -F "name=Anit" \
  -F "phone=9876543210" \
  -F "title=Book" \
  -F "image=@/path/to/photo.jpg"
curl (JSON with image URL):
curl -X POST http://localhost:4000/request \
  -H "Content-Type: application/json" \
  -d '{"name":"Anit","phone":"9876543210","title":"Book","image":"https://example.com/image.jpg"}'
GET /requests
Fetch all requests (most recent first). This endpoint is cached (LRU cache).
curl http://localhost:4000/requests
GET /requests/sorted
Fetch all requests sorted alphabetically by title (A→Z). Cached.
curl http://localhost:4000/requests/sorted
GET /requests/search?title=Book
Search requests by title (case-insensitive, partial match).
curl "http://localhost:4000/requests/search?title=book"
DELETE /request/:id
Delete a request by Mongo _id. If the request's image is a local upload (served under /uploads), server attempts to remove the file.
curl -X DELETE http://localhost:4000/request/<id>

7 — Socket.IO events
The backend emits events on the root namespace. Client connects to the server base URL.
requestAdded — payload: the created request object (JSON)
requestDeleted — payload: the deleted request object (JSON)
Frontend includes a Socket.IO client that listens to those events and updates UI in real time.

8 — Notes, troubleshooting & next steps
Image serving
Uploaded images are stored in backend/uploads/ and served statically. For production, use cloud storage (S3) or a CDN and store public URLs in DB.
Cache
Current LRU cache is in-memory and resets on server restart. For multi-instance or persistent caching, use Redis.
Large file uploads
Server currently accepts images and stores them locally. If you need limits or resizing, integrate sharp (image processing) and restrict file sizes in multer options.






# Thinking Capability Answers
Below are clear, human-written explanations to the assignment questions. You can directly use this as your `README.md`.

## 1. How would you handle **100,000 requests** efficiently if we used a database?
To handle heavy traffic like 100k requests efficiently, I would combine **scaling**, **caching**, and **query optimization**:
### Key Strategies

* **Horizontal Scaling**: Run multiple backend instances behind a load balancer.
* **Connection Pooling**: Limit and reuse DB connections instead of opening new ones for each request.
* **Read/Write Separation**: Use primary DB for writes and replicas for read-heavy load.
* **Caching Layer (Redis/Memcached)**: Store frequently accessed data in in-memory cache to avoid DB hits.
* **Indexing**: Add proper indexes to speed up queries.
* **Optimized Queries**: Avoid SELECT *, use pagination, avoid N+1 queries.
* **Batch Operations**: Bulk insert/update instead of many small queries.
* **Asynchronous Jobs**: Offload heavy tasks to background workers (RabbitMQ, Bull, Kafka).
* **Sharding / Partitioning**: Split large tables by key (e.g., user_id) if necessary.
This architecture ensures the system can handle traffic spikes smoothly.


## 2. Which data structure would you use for:
### a) **Fast insertion and fast search**
**Hash Table (HashMap)**
* Average O(1) insertion and lookup.
* Best when we don’t care about order.
Alternative (for strings): **Trie**
* Useful for prefix search, autocomplete.

### b) **Efficient sorted retrieval**
**Balanced Binary Search Tree (Red-Black Tree, AVL Tree)**
* O(log n) insert, delete, search.
* Items always remain sorted.
**B-Tree / B+Tree**
* Used by almost all databases.
* Excellent for large disk-based sorted data.
**Skip List** (used in Redis Sorted Sets)
* O(log n) operations.
* Great for concurrent access.

## 3. How would you implement **real-time updates** using Socket.IO?
### 🔧 Implementation Steps
1. **Setup Socket.IO** on the backend and attach it to the HTTP server.
2. **On client connect**, authenticate the user and join them into relevant rooms.
3. **Emit events** whenever data in the database changes.
4. **Broadcast updates** to all users inside a specific room.
5. **Use Redis Adapter** to scale Socket.IO across multiple server instances.
### Example Workflow
* User adds/updates a request → backend saves to DB → emits event using Socket.IO → all connected clients instantly receive the update.
### Example Event
io.to("requests").emit("request-updated", updatedData);
This ensures low-latency, real-time communication for all connected users.

## 4. What cache algorithm would you use for frequently requested data and why?
### My choice: **LRU (Least Recently Used)**
* Works best because recent data is usually needed again.
* Automatically removes old, unused items when memory is full.
* Simple and widely supported (Redis LRU policy).
### When to use LFU
* If the same item is requested very frequently over long periods.
* Redis also supports LFU mode for long-term hot keys.
### With Caching, I use:
* **Cache-Aside Pattern**: app checks cache → DB → updates cache.
* **TTL (Time to Live)**: prevents serving stale data.
* **Invalidate on Write**: update cache when DB updates.
Overall: **LRU + TTL + cache-aside** is reliable and production-ready.





9 — License

This project template is provided as-is under the MIT License. Use and modify freely.
