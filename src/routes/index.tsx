import { createFileRoute, Link } from "@tanstack/react-router";
import Hero from "@/assets/banner.png";
import { Icon } from "@iconify/react/dist/iconify.js";
import Dice from "@/assets/diceroll-cover.jpg";
import Coinflip from "@/assets/coinflip-cover.png";

export const Route = createFileRoute("/")({
  component: Index,
  // loader: async () => {
  //   return redirect({ to: "/coming-soon" });
  // },
});

function Index() {
  return (
    <div className="p-4 max-w-[1440px] mx-auto">
      <div
        style={{ backgroundImage: `url(${Hero})` }}
        className="rounded-[40px] bg-cover bg-center bg-no-repeat  aspect-[10/4] w-full"
      />
      <div className="flex items-center gap-2 py-5">
        <Icon icon="mdi:dice" className="text-white/50 text-2xl" />
        <span className="text-white/50 text-xl tracking-tight font-Onest font-semibold">
          Featured Games
        </span>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/games/diceroll">
          <img
            src={Dice}
            alt="Dice"
            className="rounded-3xl aspect-[1/1] w-[200px] cursor-pointer"
          />
        </Link>
        <Link to="/games/coinflip">
          <img
            src={Coinflip}
            alt="Coinflip"
            className="rounded-3xl aspect-[1/1] w-[200px] cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
}
