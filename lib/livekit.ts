export function resolveRoomName() {
  return process.env.LIVEKIT_ROOM_NAME || "friends-room";
}

export function toLivekitHttpUrl(wsUrl: string) {
  return wsUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}
