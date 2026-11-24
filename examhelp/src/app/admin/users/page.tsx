import type { Metadata } from "next";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

// Stand-alone link for the admin Users page (Paid / Non-paid). Same admin sign-in; the data is
// still protected in the database, so this page shows nothing without an admin login.
export const metadata: Metadata = {
  title: "Users | TETTESTHUB Admin",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div className="container-page py-8">
      <UsersAdmin standalone />
    </div>
  );
}
