import { GameClient } from "./game-client";

export const metadata = {
  title: "Bug Smash",
};

export default function GamePage() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <GameClient />
    </div>
  );
}
