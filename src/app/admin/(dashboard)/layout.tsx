import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { getAdminCounts } from "@/lib/admin";
import { requireAdminPage } from "@/lib/session";

/**
 * Console shell for every signed-in admin route.
 *
 * The proxy already redirects anonymous visitors, but pages re-check here
 * because the guard also supplies the session used by the header and sidebar.
 */

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Sundrive Autos Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();
  const counts = await getAdminCounts();

  return (
    <AdminShell session={session} counts={counts}>
      {children}
    </AdminShell>
  );
}
