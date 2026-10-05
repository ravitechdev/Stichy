# STICHY

**Perfect Fit. Powered by AI.** A MERN platform for college uniform tailoring with a privacy-first, browser-based MediaPipe pose workflow.

## Run locally

1. Install Node.js 20+ and start MongoDB locally (or create a free MongoDB Atlas database).
2. Copy `server/.env.example` to `server/.env`, then configure `MONGODB_URI` and a strong `JWT_SECRET`.
3. Install all packages:

```bash
npm run install:all
```

4. Optional: add a demo college, products, and verified demo tailor:

```bash
npm run seed --prefix server
```

5. Start API and client together:

```bash
npm run dev
```

Open `http://localhost:5173` in Chrome or Edge. Camera access needs localhost or HTTPS and a webcam.

## Important AI disclosure

MediaPipe Pose Landmarker runs from the live browser camera feed. STICHY calculates only landmark-supported linear estimates from the entered height calibration. It does not hardcode or randomize body measurements. Unsupported measurements are returned as unavailable for manual entry. See [project documentation](docs/project-documentation.md) for method, test plan, limitations, and architecture.
