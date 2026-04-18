import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseSession, SESSION_COOKIE } from "@/lib/users";

export default async function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = parseSession(raw);

  if (!session) {
    redirect("/login?next=/tenant-dashboard");
  }
  
  if (session.role !== "tenant") {
    redirect("/owner-dashboard");
  }

  return <>{children}</>;
}
