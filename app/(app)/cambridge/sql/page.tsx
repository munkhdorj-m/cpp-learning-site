import { SqlWorkbench } from "@/components/cambridge/sql-workbench";

export const metadata = {
  title: "SQL playground",
  description:
    "Write SQL against a sample school database and see the rows it returns.",
};

export default function CambridgeSqlPage() {
  return <SqlWorkbench />;
}
