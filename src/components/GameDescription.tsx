"use client";

import { Icon } from "@iconify/react";

interface GameRule {
  title: string;
  description: string;
  icon: string;
}

interface GameDescriptionProps {
  rules: GameRule[];
  howToPlay: string[];
  strategy: string[];
}

export default function GameDescription({
  rules,
  howToPlay,
  strategy,
}: GameDescriptionProps) {
  return (
    <div className="space-y-6">
      {/* Rules Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/90">Game Rules</h3>
        <div className="grid gap-3">
          {rules.map((rule, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-[#6fc7ba]/20 p-1.5 rounded-lg">
                  <Icon icon={rule.icon} className="text-[#6fc7ba] text-sm" />
                </div>
                <p className="text-xs font-medium text-white/90">
                  {rule.title}
                </p>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Play Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/90">How to Play</h3>
        <div className="bg-white/5 rounded-lg p-3">
          <ol className="list-decimal list-inside space-y-2">
            {howToPlay.map((step, index) => (
              <li
                key={index}
                className="text-[11px] text-white/70 leading-relaxed"
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Strategy Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/90">Strategy Tips</h3>
        <div className="bg-white/5 rounded-lg p-3">
          <ul className="list-disc list-inside space-y-2">
            {strategy.map((tip, index) => (
              <li
                key={index}
                className="text-[11px] text-white/70 leading-relaxed"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
