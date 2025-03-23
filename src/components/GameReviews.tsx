"use client";

import { Icon } from "@iconify/react";

interface Review {
  username: string;
  rating: number;
  comment: string;
  date: string;
}

interface GameReviewsProps {
  overallRating: number;
  totalReviews: number;
  reviews: Review[];
}

export default function GameReviews({
  overallRating,
  totalReviews,
  reviews,
}: GameReviewsProps) {
  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white/90">
              {overallRating.toFixed(1)}
            </p>
            <div className="flex items-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="ph:star-fill"
                  className={
                    i < Math.round(overallRating)
                      ? "text-[#6fc7ba]"
                      : "text-white/20"
                  }
                  width={14}
                />
              ))}
            </div>
            <p className="text-[10px] text-white/50 mt-1">
              {totalReviews} reviews
            </p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter(
                (r) => Math.round(r.rating) === stars,
              ).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={stars} className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(stars)].map((_, i) => (
                      <Icon
                        key={i}
                        icon="ph:star-fill"
                        className="text-white/20"
                        width={10}
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6fc7ba]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/50 w-8">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/90">
                {review.username}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      icon="ph:star-fill"
                      className={
                        i < Math.round(review.rating)
                          ? "text-[#6fc7ba]"
                          : "text-white/20"
                      }
                      width={12}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/50">{review.date}</p>
              </div>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
