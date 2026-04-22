# Draft - AI Home & Interior Design

Draft is an advanced AI-powered platform for architectural visualization and interior design. It uses Google's Gemini 2.0 models to generate 3D layouts from text and curated interior ideas from photos.

## 🚀 Getting Started (Run Locally)

If you have downloaded this project as a **ZIP**, follow these exact steps to ensure the AI and Security features work correctly on your computer:

### 1. Configure the Environment
I have pre-created a **`.env`** file in the root folder for you.
1.  Open the file named **`.env`** in a text editor (like Notepad or VS Code).
2.  Add your Gemini API Key in the first line:
    ```env
    GEMINI_API_KEY=your_actual_key_here
    ```

### 2. Install Dependencies
You need [Node.js](https://nodejs.org/) installed. Open your terminal in the project folder and run:
```bash
npm install
```

### 3. Start the Platform
Run the development command:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🔒 Permission Troubleshooting

If the app says **"Permission Denied"** or **"Access Blocked"**:

### Firebase Domain Configuration
If you are hosting this on a new domain (e.g., GitHub Pages or your own server), you **must** authorize the domain in Firebase:
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Go to **Authentication** > **Settings** > **Authorized Domains**.
3.  Add your new domain (e.g., `yourname.github.io`).

### Browser Permissions
-   **Lock Icon**: Click the 🔒 lock icon in your browser's address bar.
-   **Reset Permissions**: Click "Reset Permissions" and refresh the page.
-   **Allow Popup**: If Sign-In doesn't show up, ensure your browser isn't blocking popups.

---

## 🛠️ Tech Stack

-   **Frontend**: React 18, Three.js (@react-three/fiber), Tailwind CSS
-   **Backend**: Node.js, Express (Proxy for API Security)
-   **AI**: Google GenAI (Gemini 2.0 Flash)
-   **Database/Auth**: Firebase Firestore & Firebase Auth
-   **Animations**: Motion (Framer)

---

## 📦 Project Structure

-   `/src`: Frontend source code
-   `/server.ts`: Backend Express server (Proxy for AI keys)
-   `/firestore.rules`: Security rules for the database
-   `/firebase-blueprint.json`: Data structure definition
-   `/package.json`: Dependencies and scripts
