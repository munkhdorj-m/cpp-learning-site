import { PseudocodeWorkbench } from "@/components/cambridge/pseudocode-workbench";

export const metadata = {
  title: "Pseudocode playground",
  description:
    "Write Cambridge pseudocode and run it, with INPUT and OUTPUT that work.",
};

export default function CambridgePseudocodePage() {
  return <PseudocodeWorkbench />;
}
