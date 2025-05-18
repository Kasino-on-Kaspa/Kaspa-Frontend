import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-Onest tracking-tight mb-4 text-[#6fc7ba]">
          About Kaspa Casino
        </h1>
        <p className="text-lg text-gray-400 font-DM-Sans max-w-2xl mx-auto">
          Your premier destination for decentralized gaming on the Kaspa
          network, where innovation meets entertainment.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#2A2A2A] rounded-3xl p-6 border border-transparent hover:border-[#6fc7ba]/20 transition-all"
        >
          <div className="w-12 h-12 bg-[#6fc7ba]/10 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[#6fc7ba]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-Onest">
            Secure Gaming
          </h3>
          <p className="text-gray-400 font-DM-Sans">
            Built on Kaspa's blockchain technology, ensuring transparent and
            tamper-proof gaming experiences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#2A2A2A] rounded-3xl p-6 border border-transparent hover:border-[#6fc7ba]/20 transition-all"
        >
          <div className="w-12 h-12 bg-[#6fc7ba]/10 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[#6fc7ba]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-Onest">
            Fast Transactions
          </h3>
          <p className="text-gray-400 font-DM-Sans">
            Experience lightning-fast deposits and withdrawals powered by
            Kaspa's high-performance network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#2A2A2A] rounded-3xl p-6 border border-transparent hover:border-[#6fc7ba]/20 transition-all"
        >
          <div className="w-12 h-12 bg-[#6fc7ba]/10 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[#6fc7ba]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-Onest">
            Community Driven
          </h3>
          <p className="text-gray-400 font-DM-Sans">
            Join a thriving community of players and enthusiasts, competing and
            connecting globally.
          </p>
        </motion.div>
      </div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#2A2A2A] rounded-3xl p-8 mb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h4 className="text-3xl font-bold text-[#6fc7ba] mb-2 font-Onest">
              1M+
            </h4>
            <p className="text-gray-400 font-DM-Sans">Games Played</p>
          </div>
          <div className="text-center">
            <h4 className="text-3xl font-bold text-[#6fc7ba] mb-2 font-Onest">
              500K+
            </h4>
            <p className="text-gray-400 font-DM-Sans">Active Players</p>
          </div>
          <div className="text-center">
            <h4 className="text-3xl font-bold text-[#6fc7ba] mb-2 font-Onest">
              10M+
            </h4>
            <p className="text-gray-400 font-DM-Sans">KAS Wagered</p>
          </div>
        </div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-Onest">
          Our Mission
        </h2>
        <p className="text-gray-400 text-lg font-DM-Sans">
          To revolutionize online gaming by leveraging Kaspa's blockchain
          technology, providing a secure, transparent, and entertaining platform
          where players can enjoy their favorite games with complete confidence.
        </p>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={() => {
          navigate({ to: "/" });
        }}
        className="bg-gradient-to-r from-[#6fc7ba]/20 to-[#6fc7ba]/10 rounded-3xl p-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-Onest">
          Ready to Join?
        </h2>
        <p className="text-gray-400 mb-6 font-DM-Sans">
          Start your gaming journey with Kaspa Casino today.
        </p>
        <button className="bg-[#6fc7ba] text-[#231f20] px-8 py-3 rounded-xl font-semibold hover:bg-[#6fc7ba]/90 transition-all font-DM-Sans">
          Play Now
        </button>
      </motion.div>
    </div>
  );
}
