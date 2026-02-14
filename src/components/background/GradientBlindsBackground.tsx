"use client";

/**
 * グラデーションブラインド背景コンポーネント
 * 縦長のグラデーションバーが上下にスライドアニメーション
 * カウントダウンページのダークテーマ背景として使用
 */
export function GradientBlindsBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#1a0a2e]">
      <div className="relative h-full w-full">
        {/* グラデーションバー1 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-[#CD79EE]/20 via-purple-500/10 to-transparent animate-slide-up"
          style={{ left: "5%" }}
        />

        {/* グラデーションバー2 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-purple-600/15 via-[#CD79EE]/10 to-transparent animate-slide-up"
          style={{ left: "20%", animationDelay: "2s" }}
        />

        {/* グラデーションバー3 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-[#CD79EE]/25 via-purple-400/10 to-transparent animate-slide-up"
          style={{ left: "35%", animationDelay: "4s" }}
        />

        {/* グラデーションバー4 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-purple-500/20 via-[#CD79EE]/15 to-transparent animate-slide-up"
          style={{ left: "50%", animationDelay: "6s" }}
        />

        {/* グラデーションバー5 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-[#CD79EE]/18 via-purple-600/10 to-transparent animate-slide-up"
          style={{ left: "65%", animationDelay: "8s" }}
        />

        {/* グラデーションバー6 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-purple-400/22 via-[#CD79EE]/12 to-transparent animate-slide-up"
          style={{ left: "80%", animationDelay: "10s" }}
        />

        {/* グラデーションバー7 */}
        <div
          className="absolute top-0 h-[200%] w-[14.28%] bg-gradient-to-b from-[#CD79EE]/20 via-purple-500/10 to-transparent animate-slide-up"
          style={{ left: "95%", animationDelay: "12s" }}
        />
      </div>
    </div>
  );
}
