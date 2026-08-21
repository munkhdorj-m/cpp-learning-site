import { ProblemForm } from "../problem-form";
import { requireTeacher } from "@/lib/auth-helpers";

export default async function NewProblemPage() {
  await requireTeacher();
  return <ProblemForm />;
}
