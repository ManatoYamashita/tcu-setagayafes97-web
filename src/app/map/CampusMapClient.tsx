"use client";

import { useState } from "react";
import Link from "next/link";
import type { Building } from "@/data/buildings";

interface CampusMapClientProps {
  buildings: readonly Building[];
  infoDesks: readonly {
    id: string;
    name: string;
    building: string;
    floor: string;
    description: string;
    position: { x: number; y: number; z: number };
  }[];
}

/**
 * キャンパスマップクライアントコンポーネント
 * SVGでインタラクティブなマップを描画
 */
export function CampusMapClient({ buildings, infoDesks }: CampusMapClientProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  // 3D座標を2D座標に変換
  const convertTo2D = (x: number, z: number) => {
    const scale = 3; // スケール係数
    const offsetX = 500; // viewBox中心X
    const offsetY = 375; // viewBox中心Y
    return {
      x: x * scale + offsetX,
      y: z * scale + offsetY,
    };
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* SVGマップ */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-gray-100 p-4">
              <h2 className="text-lg font-bold text-gray-900">世田谷キャンパス</h2>
              <p className="text-sm text-gray-600">建物をクリックして企画を検索</p>
            </div>
            <svg
              viewBox="0 0 1000 750"
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 背景 */}
              <rect x="0" y="0" width="1000" height="750" fill="#f0f9ff" />

              {/* グリッド線（補助線） */}
              <g opacity="0.1">
                {[...Array(20)].map((_, i) => (
                  <g key={i}>
                    <line
                      x1={i * 50}
                      y1="0"
                      x2={i * 50}
                      y2="750"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1={i * 37.5}
                      x2="1000"
                      y2={i * 37.5}
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </g>

              {/* 建物描画 */}
              {buildings.map((building) => {
                const pos = convertTo2D(building.position.x, building.position.z);
                const size = 60;
                const isSelected = selectedBuilding?.id === building.id;

                return (
                  <g
                    key={building.id}
                    onClick={() => setSelectedBuilding(building)}
                    className="cursor-pointer transition-all"
                  >
                    {/* 建物本体 */}
                    <rect
                      x={pos.x - size / 2}
                      y={pos.y - size / 2}
                      width={size}
                      height={size}
                      fill={isSelected ? "#9333ea" : building.color}
                      stroke={isSelected ? "#7e22ce" : "#1e293b"}
                      strokeWidth={isSelected ? 4 : 2}
                      rx="4"
                      className="transition-all hover:brightness-110"
                    />
                    {/* 建物ID（中央） */}
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="20"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {building.name.replace("号館", "").replace("体育館", "体")}
                    </text>
                    {/* 建物名（下部） */}
                    <text
                      x={pos.x}
                      y={pos.y + size / 2 + 18}
                      textAnchor="middle"
                      fill="#1e293b"
                      fontSize="14"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {building.name}
                    </text>
                  </g>
                );
              })}

              {/* 案内所描画 */}
              {infoDesks.map((desk) => {
                const pos = convertTo2D(desk.position.x, desk.position.z);

                return (
                  <g key={desk.id}>
                    {/* 案内所マーカー */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="15"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="3"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      i
                    </text>
                    {/* 案内所名 */}
                    <text
                      x={pos.x}
                      y={pos.y + 30}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="12"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {desk.name}
                    </text>
                  </g>
                );
              })}

              {/* 凡例 */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="180" height="80" fill="white" opacity="0.9" rx="4" />
                <text x="10" y="20" fontSize="14" fontWeight="bold" fill="#1e293b">
                  凡例
                </text>
                <rect x="10" y="30" width="20" height="20" fill="#CD79EE" rx="2" />
                <text x="35" y="45" fontSize="12" fill="#1e293b">
                  建物
                </text>
                <circle cx="20" cy="65" r="8" fill="#10b981" />
                <text x="35" y="70" fontSize="12" fill="#1e293b">
                  案内所
                </text>
              </g>
            </svg>
          </div>

          {/* サイドパネル */}
          <div className="space-y-6">
            {/* 選択中の建物情報 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">建物情報</h2>
              {selectedBuilding ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{selectedBuilding.name}</h3>
                    <p className="mt-2 text-gray-700">{selectedBuilding.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">階数</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedBuilding.floors}階建て
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">建物ID</p>
                      <p className="text-lg font-bold text-gray-900">{selectedBuilding.id}</p>
                    </div>
                  </div>
                  <Link
                    href={`/events?building=${selectedBuilding.name}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
                  >
                    この建物の企画を見る
                  </Link>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">建物をクリックして詳細を表示</p>
                </div>
              )}
            </div>

            {/* 建物一覧 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">建物一覧</h2>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {buildings.map((building) => (
                  <button
                    key={building.id}
                    onClick={() => setSelectedBuilding(building)}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                      selectedBuilding?.id === building.id
                        ? "border-primary bg-purple-50"
                        : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{building.name}</p>
                        <p className="text-sm text-gray-600">{building.description}</p>
                      </div>
                      <div
                        className="h-8 w-8 flex-shrink-0 rounded"
                        style={{ backgroundColor: building.color }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* アクセスリンク */}
            <Link
              href="/map/access"
              className="block rounded-lg border-2 border-primary bg-white p-4 text-center font-semibold text-primary transition-all hover:bg-primary hover:text-white"
            >
              交通アクセスを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
