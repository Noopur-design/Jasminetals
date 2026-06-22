import { redirect } from "next/navigation";

// The separate /admin login door has been removed in favour of a single sign-in
// at /login (owner emails land in the studio panel automatically). Keep this path
// as a redirect so old links/bookmarks still work.
export default function AdminRedirectPage() {
  redirect("/login");
}
