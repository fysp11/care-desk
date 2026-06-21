## **Full-Stack Engineering Take-Home Assignment: Patients Management System**

**Intro:**  
This case is for the second round of interviews. It is intentionally broad, so prioritisation is key. We are looking for a clear point of view, a well-reasoned solution, and strong code quality. A smaller, well-executed solution is preferred over a large but shallow one.

## **Objective**

Build a **full-stack Patients Management system** with a **Next.js \+ TypeScript frontend** and a **NestJS backend**. The goal is to evaluate your ability to:

* Build a **scalable, maintainable, and production-ready full-stack application**  
* Implement **role-based authentication & authorization**  
* Design a **clean, accessible, responsive, and polished UI**  
* Ensure **performance, reliability, and UX excellence**

**Frontend:** Next.js \+ TypeScript  
**Backend:** NestJS \+ TypeScript \+ PostgreSQL (Prisma optional)  
**Styling:** Tailwind CSS \+ shadcn/ui preferred

---

## **Scope**

### **1) Authentication (Role-aware)**

* Login page (email/password). Persist a token (mock) with `role` claim: `admin` or `user`.  
* Route protection \+ logout \+ token expiry handling (mock expiry is fine).  
* Role rules:  
  * `admin`: create/update/delete patients.  
  * `user`: view-only.

### **2) Patients Experience**

* **Patients List**  
  * Data table with **search**, **sort** (e.g., lastName, dob), and **pagination** (or infinite scroll).  
  * **Empty**, **loading skeleton**, **error** states.  
  * Row actions (edit/delete) gated by role.  
* **Create/Edit Patient**  
  * Fields: `firstName`, `lastName`, `email`, `phoneNumber`, `dob`.  
  * Strong client validation (e.g., zod \+ react-hook-form).  
  * **Optimistic updates** \+ rollback on failure.  
* **Details View**  
  * Modal or page with full record

### **3) Design & Theming (show your taste)**

* Implement a **theme** (light \+ optionally dark) with design tokens:  
  * **Typography**: clear hierarchy, readable line-height, sensible scale.  
  * **Colors**: semantic palette (primary/success/warning/error/neutral).  
  * **Spacing/radius/elevation**: consistent scale and usage.  
* **Micro-interactions**: focus/hover states, subtle transitions, button and dialog motion.  
* **Responsiveness**: mobile → tablet → desktop; table behavior adapts (column collapse, overflow, or stacked rows).

**4) Backend Architecture & Design (show your taste)**

Design your backend with **clean architecture, scalability, and maintainability** in mind:

* **Folder Structure & Modules:**  
  * Clear separation of concerns: controllers, services, modules, DTOs, entities.  
  * Logical organization that scales with additional features.  
* **API Design:**  
  * RESTful endpoints with consistent naming, HTTP verbs, and status codes.  
  * Role-based access control: `admin` vs `user` enforced via guards or middleware.  
  * Proper error handling and validation (e.g., class-validator for DTOs).  
* **Database & ORM:**  
  * Use a relational database (PostgreSQL).  
  * Clean data models with relations and constraints.  
  * Use ORM (e.g., Prisma) for type-safe queries and migrations.  
* **Security & Auth:**  
  * JWT-based authentication with token expiration.  
  * Password hashing (bcrypt) and secure storage.  
  * Route protection with clear 401/403 responses.  
* **Performance & Reliability:**  
  * Optimize queries, handle errors gracefully, and support pagination.  
  * Optional: caching or rate-limiting where appropriate.  
* **Testing & Dev Experience:**  
  * Unit tests for services, integration tests for API endpoints.  
  * Clear, maintainable code with strict TypeScript and linting rules.  
* **Micro-interactions & Developer Touch:**  
  * Logging and structured responses for easy debugging.  
  * Thoughtful modularity to make the backend easy to extend.


---

## **Technical Requirements**

* **Stack**: Next.js \+ TypeScript \+ NestJS (required). Prisma is a plus.  
* **UI**: Any styling approach is acceptable; **Tailwind \+ shadcn/ui** is preferred.  
* **Accessibility**: Strong focus on building inclusive, usable interfaces.  
* **Performance**:  
  * Route/code splitting where it makes sense  
  * Fast perceived load (e.g., skeletons, loading states)  
  * Smooth, responsive interactions  
* **Developer Experience**: We will also evaluate:  
  * ESLint \+ Prettier \+ strict TypeScript configuration  
  * Clear, logical folder structure  
  * Reusable, composable primitives

---

## **API Contract** 

### **Backend API Endpoints**

* **POST /auth/login**  
  * **Request:** `{ email, password }`  
  * **Response:** `{ token, user: { email, role } }`  
  * **Role:** Any

* **GET /patients**  
  * **Request:** \-  
  * **Response:** `{ data: Patient[], page, limit, total }`  
  * **Role:** Admin / User

* **GET /patients/:id**

  * **Request:** \-  
  * **Response:** `Patient`  
  * **Role:** Admin / User

* **POST /patients**  
  * **Request:** `Patient`  
  * **Response:** `Patient`  
  * **Role:** Admin only

* **PUT /patients/:id**

  * **Request:** `Patient`  
  * **Response:** `Patient`  
  * **Role:** Admin only

* **DELETE /patients/:id**

  * **Request:** \-  
  * **Response:** `{ ok: true }`  
  * **Role:** Admin only

Return 401/403 where appropriate. Randomly simulate latency and occasional failures to demonstrate resilience.

---

### **Bonus Points:**

* **Docker setup**: use docker and docker compose to containerize your solution  
* **Cloud Hosting**: Host your solution on a cloud platform (e.g., AWS, Azure, or Netlify).  
* **Test Coverage**: Include unit and integration tests for the API and frontend.

---

## **Deliverables**

1. Deliverables:  
   1. A fully functional repository on **GitHub**.  
   2. A **README file** with clear instructions on how to:  
      * Clone the repo.  
      * Set up the backend and frontend locally.  
      * Run the application.  
   3. A link to the hosted application in the cloud (if done).

---

### 

### **What We’re Looking For** 

A senior engineer who can:

* **Frontend:**  
  * Design a **polished, accessible, and responsive theme**  
  * Craft a **seamless user experience** with attention to micro-interactions  
  * Pick a **cohesive color palette** and fine-tune **typography, spacing, and hierarchy**  
  * Build **fast, reliable, maintainable, and production-ready frontend code** that scales for teams  
* **Backend:**  
  * Architect a **clean, modular, and scalable backend**  
  * Implement **secure, role-based authentication and authorization**  
  * Design **robust, well-structured APIs** with proper validation, error handling, and test coverage  
  * Ensure **reliability, performance, and maintainability** in database design, services, and business logic  
* **Full-Stack Mindset:**  
  * Deliver a **seamless integration between frontend and backend**  
  * Think **end-to-end**, from API design to UI/UX, ensuring **consistency, performance, and scalability**

**Time expectation**

Aim for roughly **3-4 hours.** Do not grind a full weekend. When you run out of time, **stop and write down what you cut**. Knowing what to leave out is part of the evaluation.

**Tooling**

You may use any AI tools (Claude, Copilot, ChatGPT, etc.), we encourage it. There's nothing to disclose. **But you own every line.** In the follow-up interview we will walk through your code and ask you to justify architecture, trade-offs, and edge-case behavior. If you can't defend it, it doesn't count in your favor.

**Important:** During the next interview, we will evaluate your **understanding of the code you wrote or generated**. Make sure you can explain your implementation choices, architecture, and any trade-offs you made.

**What we're evaluating**

* **Judgment under ambiguity** \-  where a senior points limited time when handed more than they can do.  
* **Backend depth** \- data modeling, authorization-as-data-access, error handling, resilience against a flaky dependency, test taste.  
* **Full-stack coherence** \- a clean integration end to end, not a beautiful UI on a hollow API.  
* **Ownership** \- can you defend every decision in the follow-up, including the AI-assisted parts.