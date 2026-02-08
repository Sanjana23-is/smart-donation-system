# Smart Donation System

A full-stack donation and distribution management platform designed to streamline product and money donations, admin verification, inventory handling, and transparent tracking.

---

## Overview

The Smart Donation System enables donors to submit product or monetary donations through a unified platform.  
All donations go through **AI-assisted pre-screening** and **admin verification** before being accepted, rejected, or redirected.

If there is **no active disaster** and a donated product has a **limited remaining shelf life**, the system intelligently redirects it to **orphanages or NGOs** to avoid wastage.

---

## Key Features

### Donor Side
- User registration and authentication
- Product and money donation requests
- Real-time donation status tracking
- In-app notifications for approval/rejection

### Admin Side
- Centralized admin dashboard
- Review and approve/reject donations
- Inventory management
- Automatic tracking history generation
- Donation redirection based on urgency and availability

---

## AI Integration

The system includes a **lightweight AI module** for product verification:
- Local image analysis using **TensorFlow.js + MobileNet**
- Rule-based risk scoring
- Automatic classification into **approved / review / rejected**
- AI acts as a decision-support tool for admins (not a final authority)

---

## Workflow Summary

1. Donor submits a donation request  
2. AI performs initial screening  
3. Admin reviews and takes final action  
4. Approved items move to inventory  
5. Items are dispatched to disaster zones or orphanages as required  
6. Full tracking history is maintained  

---

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- Axios

**Backend**
- Node.js
- Express.js
- MySQL

**AI**
- TensorFlow.js
- MobileNet (pretrained)

---

## Project Status

- Core functionality implemented
- AI screening integrated
- Notifications and tracking enabled
- Actively evolving

---

## Author

**Sanjana**  
Information Science Engineering  
