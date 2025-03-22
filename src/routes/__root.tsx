import Marquee from "@/components/Marquee";
import Sidebar from "@/components/Sidebar";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <Marquee />
      <Sidebar />
      <div className="md:ml-[245px] mt-10">
        <Outlet />
      </div>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
