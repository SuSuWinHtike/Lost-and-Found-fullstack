# Community-Based Lost and Found Pet Platform ("PetLove")

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

> **Final Year Project Repository:** [https://github.com/SuSuWinHtike/Lost-and-Found.git](https://github.com/SuSuWinHtike/Lost-and-Found.git)  
> **Author & Project Lead:** Su Su Win Htike  
> **Project Scope:** Frontend Engineering UI for Community Lost & Found Pet Reunification Platform  

---

## 📖 About The Project

**PetLove** is a modern, responsive, and community-centered lost and found pet web platform designed to reunite lost cats and dogs with their families. Built with a soothing, pet-friendly color scheme (warm cream, soft honey-amber, and rich espresso), the platform provides dedicated experiences for **Public Visitors**, **Registered Pet Owners & Finders**, and **System Administrators**.

The project is an **autonomous client-side single page application (SPA)** with in-memory state management, requiring **no backend or database server** to run.

---

## 📑 Detailed Functional Scope

For the complete, university-standard specification document covering all modules, workflows, data schemas, and role permissions, please inspect:
👉 **[FRONTEND_FUNCTIONAL_SCOPE.md](./FRONTEND_FUNCTIONAL_SCOPE.md)**

---

## 🚀 Key Highlights & Features

### 🐾 Public Portal
- **Hero Landing Page:** Clean Japanese-inspired pet hero presentation with floating quick-search and verified statistics ribbon.
- **Recent Reports Feed:** Live grid of newly reported missing and found companion pets.
- **How It Works & Community Call-To-Action:** Visual step-by-step guidance for pet parents and volunteers.
- **Authentication:** Interactive Login and Registration modals with client-side validation and quick demo login buttons.

### 👤 User Workspace (Top Navigation Design)
- **Top Navigation Bar:** Clean top bar navigation with quick-access links (`Pet Reports`, `Possible Matches`, `Community Assistance`, `Messages`, `+ Report a Pet`).
- **Profile Pop-Up Menu:** Top-right profile pop-up granting direct access to **User Dashboard**, **My Submitted Reports**, **Profile Settings**, and **Admin Control Panel**.
- **Unified Pet Reports Directory:** ONE combined listing page with 3 reactive tabs (**All Pets**, **Lost Pets**, **Found Pets**), multi-field filtering (Species, Breed, Color, Myanmar State/Region, Township, Date), and 1-click Quick Filters (Dogs, Cats, Yangon, Mandalay, Reward, Saved).
- **Create Report Portal:** Dual-form workflow for Lost and Found pets with client-side drag-and-drop multiple image uploads, instant thumbnail preview, and removal controls.
- **Automated Possible Matches Engine:** Heuristic matching algorithm cross-referencing lost and found pets with calculated percentage confidence scores and side-by-side comparison modal.
- **Real-Time Mock Messaging:** Responsive split-pane chat interface with simulated caretaker auto-reply.
- **Community Assistance Sightings:** Crowdsourced witness sightings feed with interactive "Submit Sighting" modal.
- **My Reports Manager:** Manage submitted pets, inline edit details, mark as Reunited, or delete reports.

### 🛡️ Admin Dashboard (Dedicated Collapsible Sidebar)
- **Analytics Overview:** Visualized with **Recharts** (Monthly Reunification Trends Bar Chart & Pet Species Distribution Pie Chart).
- **User Management:** Search, edit, suspend, or reactivate user accounts.
- **Report Moderation:** Independent approval pipelines for Lost Pet Reports and Found Pet Reports.
- **Complaints & Dispute Resolution:** Review reported posts, user flags, and resolution tracking.
- **Category Taxonomy Management:** Add, edit, or delete Pet Types, Breeds, and Pet Colors.
- **Myanmar Location Management:** Manage States, Regions, Cities, and Townships.
- **Broadcast Announcements:** Publish platform-wide alerts and updates.
- **System Reports & Audits:** Historical resolution metrics and analytics summaries.
- **Admin Settings:** System configurations and admin profile management.

---

## 🛠️ Technology Stack

- **Framework:** React 19 (JavaScript ES6+, strictly no TypeScript)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **State Management:** React Context API (`AppContext.jsx`) with local mock data

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- `npm`

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SuSuWinHtike/Lost-and-Found.git
   cd Lost-and-Found
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
Lost and Found/
├── src/
│   ├── components/
│   │   ├── common/       # Navbar, Footer, Badge, Toast, RoleSwitcher
│   │   ├── user/         # PetCard, PetDetailModal, SightingModal, UserNavbar
│   │   └── admin/        # AdminSidebar, AdminTopbar
│   ├── context/          # AppContext.jsx (Centralized state store)
│   ├── data/             # Mock datasets (pets, users, sightings, locations, categories)
│   ├── layouts/          # PublicLayout, UserLayout, AdminLayout
│   ├── pages/
│   │   ├── public/       # HomePage, LoginPage, RegisterPage
│   │   ├── user/         # UserDashboard, PetReports, CreateReport, PossibleMatches,
│   │   │                 # Messages, Notifications, CommunityAssistance, MyReports, Profile
│   │   └── admin/        # AdminDashboard, UserManagement, LostPetReports,
│   │                     # FoundPetReports, ComplaintManagement, CategoryManagement,
│   │                     # LocationManagement, AnnouncementManagement, SystemReports, AdminSettings
│   ├── App.jsx           # Application routes
│   └── index.css         # Custom theme & typography styling
├── FRONTEND_FUNCTIONAL_SCOPE.md
└── package.json
```

---

## 📄 License
This project was developed for final-year academic demonstration. Distributed under the MIT License.
