# QueueEase

**QueueEase** is a smart, real-time clinic queue management and wait-time prediction system. It helps patients book consultation slots, view their live queue position, and check predicted serving times. It also provides doctors with a simple dashboard to manage their clinic session and call patients.

The system is split into two parts:
1. **Frontend App (`queueEasy`)**: A React Native mobile app for both Android and iOS.
2. **Backend Server (`queueEasyBackend`)**: A Node.js and Express server with a MongoDB database.

---

## 🚀 Key Features

* **Real-Time Queue Updates**: When a doctor calls a patient, all patient screens update instantly.
* **AI Wait-Time Prediction**: Uses a **TensorFlow.js Neural Network** model to calculate exactly when a patient will be called. If a doctor starts late, the system automatically adjusts calculations using the current real time.
* **Intelligent Chatbot**: Powered by **Google Gemini**, a smart chatbot answers patient questions about doctor hours, room numbers, and general medical advice.
* **Doctor Session Controller**: A dedicated admin view for doctors to start/end sessions, set maximum patient limits, edit doctor credentials, and call patients.
* **Patient Profile Center**: Includes edit forms for personal details, a visual health insurance status card, and customizable notification preferences.

---

## 🛠️ Tech Stack

* **Frontend**: React Native, TypeScript, Vector SVG Icons, React Native Safe Area Context.
* **Backend**: Node.js, Express.js, Mongoose.
* **Database**: MongoDB.
* **AI Integrations**: TensorFlow.js (regression model), Google Gemini API (NLP assistant).

---

## ⚙️ Project Installation & Setup

### 1. Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas cloud URI)
* [Android SDK](https://developer.android.com/studio) and a connected device or emulator for testing

---

### 2. Backend Server Setup
1. Open your terminal and go to the backend folder:
   ```bash
   cd queueEasyBackend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `queueEasyBackend` folder and add these values:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/queueease
   JWT_SECRET=your_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:3000`.*

---

### 3. Mobile App Setup (Frontend)
1. In a new terminal window, go to the frontend app folder:
   ```bash
   cd queueEasy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Important for testing on a physical Android device**:
   Ensure your device is connected via USB and USB Debugging is turned on. Run these command-line tools to forward ports:
   ```bash
   adb reverse tcp:3000 tcp:3000
   adb reverse tcp:8081 tcp:8081
   ```
4. Build and run the app on Android:
   ```bash
   npm run android
   ```
   *The Metro Bundler will launch, compile the Kotlin native wrapper, and deploy the APK to your device.*

---


