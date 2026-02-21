import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth";
import RoomClient from "./RoomClient";

export default async function RoomPage() {
  const authSecret = process.env.ROOM_AUTH_SECRET;
  if (!authSecret) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const isAuthorized = verifyAuthToken(token, authSecret);

  if (!isAuthorized) {
    redirect("/");
  }

  return <RoomClient />;
}
