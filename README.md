# Smart Grocery List & Pantry Manager

## Overview
Smart Pantry is a mobile/web application that helps users manage groceries, track expiration dates, and get recipe suggestions based on available pantry items.

---

## Live App
👉 https://smart-grocery-list-f27bb.web.app

---

##  Features

### Pantry Management
- Add grocery items
- Edit existing items
- Delete items
- Track item quantities

### Expiration Tracking
- Detect expired items
- Identify items expiring soon
- Track expiration dates for all items

###  Alerts System
- Expired item alerts
- Expiring soon alerts
- Low stock alerts
- Displayed on dashboard

### Recipe Suggestions
- Suggest recipes based on available ingredients
- Prioritize recipes using expiring items

---

##  Tech Stack

### Frontend
- React Native (Expo)

### Backend
- Firebase Authentication

### Database
- Firebase Firestore

### Hosting
- Firebase Hosting

---

##  Project Structure
```

src/
contexts/
AuthContext.js
PantryContext.js
screens/
LoginScreen.js
SignupScreen.js
DashboardScreen.js
PantryListScreen.js
RecipeSuggestionsScreen.js
AddEditItemScreen.js
utils/
helpers.js
date.js

```

---

##  Setup Instructions

### 1. Clone the repository
```

git clone [https://github.com/OketchOdanga/SmartGrocery.git](https://github.com/OketchOdanga/SmartGrocery.git)
cd smart-grocery

```

### 2. Install dependencies
```

npm install

```

### 3. Create `.env` file
```

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

```

### 4. Run locally
```

npx expo start

```

---

##  Deployment

### Build web app
```

npx expo export -p web

```

### Deploy to Firebase
```

npx firebase deploy

```

---

##  Future Improvements
- Push notifications for expiring items
- Barcode scanner for products
- AI-powered recipe suggestions
- Offline support