import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    return <AdminLogin />;
  }

  const lots = await prisma.lot.findMany({
    orderBy: { number: "asc" },
  });

  return <AdminDashboard lots={lots} />;
}

