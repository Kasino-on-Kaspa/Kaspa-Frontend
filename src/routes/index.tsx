import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/assets/Hero.png";
import { Icon } from "@iconify/react/dist/iconify.js";
import Dice from "@/assets/Diceroll.png";
import Coinflip from "@/assets/Coinflip.png";

export const Route = createFileRoute("/")({
  component: Index,
  // loader: async () => {
  //   return redirect({ to: "/coming-soon" });
  // },
});

function Index() {
  return (
    <div className="p-4">
      <div
        style={{ backgroundImage: `url(${Hero})` }}
        className="rounded-3xl bg-cover bg-center bg-no-repeat h-[350px]"
      />
      <div className="flex items-center gap-2 py-5">
        <Icon icon="mdi:dice" className="text-white/50 text-2xl" />
        <span className="text-white/50 text-xl tracking-tight font-Onest font-semibold">
          Featured Games
        </span>
      </div>
      <div className="flex items-center gap-5">
        <img
          src={Dice}
          alt="Dice"
          className="rounded-3xl w-[200px] cursor-pointer"
        />
        <img
          src={Coinflip}
          alt="Coinflip"
          className="rounded-3xl w-[200px] cursor-pointer"
        />
      </div>
    </div>
  );
}
