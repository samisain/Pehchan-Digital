# Pehchan Digital

Pehchan Digital is a digital business card platform.

## Local Development Setup

To run this project locally on your machine, follow these steps:

### Prerequisites
* **Node.js** (v18 or newer recommended)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory and set your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: If you are using Firebase or other services, make sure to include their respective environment variables as well, referencing `.env.example`)*

3. **Run the app:**
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
