# 🧠 Knowledge Graph Engine (WIP)

A minimal, debug-first knowledge graph system built with **Next.js + Prisma + PostgreSQL**.

> ⚠️ This project is intentionally stripped down to a **bare-bones UI** to prioritize backend stability, data integrity, and core graph logic.

---

## 🚀 Core Features

* ➕ Create Nodes
* 🔗 Create Edges (relationships between nodes)
* 📄 View Nodes (raw list)
* 🌐 View Connections
* 🧪 Debug-first UI (raw JSON responses, error visibility)

---

## 🧱 Tech Stack

* **Frontend:** Next.js (minimal UI, no heavy styling)
* **Backend:** Next.js API routes / server actions
* **Database:** PostgreSQL
* **ORM:** Prisma

---

## 🎯 Philosophy

This project is currently in **Engineering Mode**:

* ❌ No animations
* ❌ No fancy UI
* ❌ No over-engineering
* ✅ Maximum focus on correctness
* ✅ Transparent data flow
* ✅ Fast iteration

> If it works → ship
> If it looks good → ignore (for now)

---

## 📂 Project Structure

```
/app
  /api
  /nodes
  /edges
/lib
  prisma.ts
/prisma
  schema.prisma
```

* Pages are intentionally flat and simple
* Logic may live directly inside pages (by design)
* Minimal abstraction to reduce debugging complexity

---

## ⚙️ Setup

### 1. Clone repo

```bash
git clone https://github.com/your-username/knowledge-graph.git
cd knowledge-graph
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create `.env`:

```env
DATABASE_URL="your_postgresql_connection_string"
```

---

### 4. Prisma setup

```bash
npx prisma generate
npx prisma db push
```

---

### 5. Run dev server

```bash
npm run dev
```

---

## 🧪 Debug UI Behavior

Every action returns:

* Raw JSON output
* Clear error messages
* Basic loading states

Example:

```json
{
  "id": 1,
  "title": "AI Systems",
  "connections": []
}
```

---

## 🧩 API Overview

### Create Node

```
POST /api/nodes
```

### Get Nodes

```
GET /api/nodes
```

### Create Edge

```
POST /api/edges
```

### Get Graph

```
GET /api/graph
```

---

## ⚠️ Known Limitations

* No authentication
* No UI/UX polish
* No validation layer (minimal checks only)
* No rate limiting
* Not production-ready

---

## 🔮 Roadmap

* [ ] Stabilize transactions & DB performance
* [ ] Add indexing + query optimization
* [ ] Introduce connection pooling
* [ ] Graph visualization layer (later phase)
* [ ] Clean UI rebuild (post-stability)

---

## 🧠 Why Bare-Bones?

Because premature UI optimization kills real systems.

This phase ensures:

* Backend correctness
* Scalable architecture
* Clean data relationships

---

## 👤 Author

**Swagata Ganguly**

* GitHub: https://github.com/Cyberclutch146
* LinkedIn: https://www.linkedin.com/in/swagata-ganguly-453aa6327

---

## ⭐ Final Note

This is not a product yet.
This is a **system under construction**.

---
