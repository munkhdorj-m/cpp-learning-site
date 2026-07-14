import { TeacherSubnav } from "@/components/teacher-subnav";
import { requireTeacher } from "@/lib/auth-helpers";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacher();
  return (
    <div className="max-w-6xl mx-auto">
      <TeacherSubnav />
      {children}
    </div>
  );
}
