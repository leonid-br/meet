# Leo Meet

Password-protected private room + LiveKit Cloud video calls.

## Local run

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Set password in `.env.local`:

```env
ROOM_PASSWORD=your_strong_password
ROOM_AUTH_SECRET=some_long_random_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_ROOM_NAME=friends-room
```

4. Start:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push project to GitHub.
2. Import repo in Vercel.
3. Add Environment Variable:
   - `ROOM_PASSWORD`
   - `ROOM_AUTH_SECRET`
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `LIVEKIT_ROOM_NAME`
4. Deploy.

After deploy:
- `/` password form
- `/room` protected page
- join with display name
- real audio/video call via LiveKit

## LiveKit Cloud setup

1. Create account and project in LiveKit Cloud.
2. Copy WebSocket URL (`wss://...livekit.cloud`) to `LIVEKIT_URL`.
3. Create server API key/secret and set:
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
4. Redeploy in Vercel after adding env variables.
