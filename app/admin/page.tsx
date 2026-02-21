import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminCookieName,
  verifyAdminToken
} from "@/lib/auth";
import AdminLoginClient from "./AdminLoginClient";

export default async function AdminPage() {
  const adminSecret = process.env.ADMIN_AUTH_SECRET || process.env.ROOM_AUTH_SECRET;
  if (adminSecret) {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value;
    if (verifyAdminToken(token, adminSecret)) {
      redirect("/admin/health");
    }
  }

  return <AdminLoginClient />;
}
