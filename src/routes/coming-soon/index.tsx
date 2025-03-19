import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/coming-soon/")({
  component: Index,
});

import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState } from "react";
import Logo from "../../assets/Logo.png";
import Sidebar from "../../components/Sidebar";
import Marquee from "../../components/Marquee";

export default function Index() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
      // Reset success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#231f20] font-onest">
      <Marquee />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-[245px] mt-10">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-40px)] p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6fc7ba]/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#6fc7ba]/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center space-y-12 max-w-6xl mx-auto px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <img
                  src={Logo}
                  alt="Kasino Logo"
                  width={120}
                  height={120}
                  className="rounded-xl"
                />
                <h1 className="text-4xl md:text-5xl font-bold text-white/90 tracking-tight">
                  Coming Soon
                </h1>
                <p className="text-white/70 max-w-md text-lg">
                  The future of decentralized casino gaming is just around the
                  corner. Get ready for an unprecedented gaming experience
                  powered by Kaspa.
                </p>
              </motion.div>

              {/* Features grid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
              >
                {[
                  {
                    icon: "ph:coin-fill",
                    title: "KAS Integration",
                    description:
                      "Seamless Kaspa cryptocurrency integration for instant deposits and withdrawals",
                  },
                  {
                    icon: "ph:game-controller-fill",
                    title: "Provably Fair",
                    description:
                      "Transparent and verifiable gaming experience with blockchain technology",
                  },
                  {
                    icon: "ph:users-three-fill",
                    title: "Community Driven",
                    description:
                      "Built for the Kaspa community, by the Kaspa community",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#2A2A2A] p-6 rounded-2xl space-y-4 shadow-lg border border-white/5 hover:border-[#6fc7ba]/20 transition-colors"
                  >
                    <div className="bg-[#6fc7ba]/20 p-3 rounded-xl w-fit mx-auto">
                      <Icon
                        icon={feature.icon}
                        className="text-[#6fc7ba] text-2xl"
                      />
                    </div>
                    <h3 className="text-white/90 font-semibold text-2xl tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Newsletter signup */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="max-w-md mx-auto space-y-4 w-full"
              >
                <p className="text-white/70 text-lg font-medium">
                  Be the first to know when we launch
                </p>
                <form onSubmit={handleSubmit} className="relative">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 focus:outline-none focus:border-[#6fc7ba] text-base"
                    />
                    <button
                      type="submit"
                      className="bg-[#6fc7ba] hover:bg-[#6fc7ba]/90 text-[#231f20] font-medium px-6 py-3 rounded-xl transition-colors text-base"
                    >
                      Join Waitlist
                    </button>
                  </div>
                  <AnimatePresence>
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 text-[#6fc7ba] mt-2 text-sm flex items-center justify-center gap-2"
                      >
                        <Icon
                          icon="ph:check-circle-fill"
                          className="text-base"
                        />
                        <span>Successfully joined the waitlist!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>

              {/* Social links */}
              {/* <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex justify-center items-center gap-6"
              >
                {[
                  { icon: "ph:twitter-logo-fill", href: "#", label: "Twitter" },
                  { icon: "ph:discord-logo-fill", href: "#", label: "Discord" },
                  {
                    icon: "ph:telegram-logo-fill",
                    href: "#",
                    label: "Telegram",
                  },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    className="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors group relative"
                  >
                    <Icon
                      icon={social.icon}
                      className="text-white/70 text-2xl group-hover:text-[#6fc7ba] transition-colors"
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {social.label}
                    </span>
                  </motion.a>
                ))}
              </motion.div> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
