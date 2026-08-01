"use client";

import React from "react";

import { MascotEmotion } from "@/constants";

interface MascotProps {
  readonly emotion?: MascotEmotion;
  readonly className?: string;
  readonly size?: number;
}

export function Mascot({
  emotion = "neutral",
  className = "",
  size = 120
}: Readonly<MascotProps>) {
  // Bảng màu của Bé Bơ Sữa (Trái Bơ dễ thương miền Tây) - Màu sắc tươi rói chuẩn Duolingo
  const outerSkinColor = "#1B4D22"; // Màu xanh vỏ bơ đậm đà, sang xịn mịn
  const innerFleshColor = "#E1F0B4"; // Màu xanh bơ sữa chín vàng béo ngậy
  const seedColor = "#795548"; // Màu hột bơ nâu hạt dẻ ấm áp
  const seedHighlight = "#8D6E63"; // Vệt sáng hột bơ mềm mại
  const hatColor = "#FEF9E7"; // Màu nón lá vàng rơm nhẹ nhàng
  const hatBorder = "#D4AC0D"; // Màu viền nón đan lá óng ả

  // Hàm vẽ mắt
  const renderEyes = () => {
    switch (emotion) {
      case "happy":
        return (
          <>
            {/* Mắt cười híp mí trái */}
            <path
              d="M 46 48 Q 51 42 56 48"
              fill="none"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Mắt cười híp mí phải */}
            <path
              d="M 68 48 Q 73 42 78 48"
              fill="none"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        );
      case "panicking":
        return (
          <>
            {/* Mắt tròn ngơ ngác trái */}
            <circle cx="51" cy="46" r="6" fill="white" stroke="#1F2937" strokeWidth="2" />
            <circle cx="51" cy="46" r="2.5" fill="#1F2937" />

            {/* Mắt tròn ngơ ngác phải */}
            <circle cx="73" cy="46" r="6" fill="white" stroke="#1F2937" strokeWidth="2" />
            <circle cx="73" cy="46" r="2.5" fill="#1F2937" />

            {/* Cặp chân mày lo lắng */}
            <path d="M 45 36 Q 51 39 57 36" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            <path d="M 67 36 Q 73 39 79 36" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case "cheering":
        return (
          <>
            {/* Mắt trái cười nháy */}
            <path
              d="M 46 48 Q 51 42 56 48"
              fill="none"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Mắt phải tròn xoe long lanh */}
            <circle cx="73" cy="46" r="6" fill="white" stroke="#1F2937" strokeWidth="2" />
            <circle cx="72" cy="46" r="2.5" fill="#1F2937" />
            <circle cx="74" cy="44.5" r="1" fill="white" />
          </>
        );
      case "neutral":
      default:
        return (
          <>
            {/* Mắt trái tròn đen lấp lánh */}
            <circle cx="51" cy="46" r="6" fill="white" stroke="#1F2937" strokeWidth="2" />
            <circle cx="50" cy="46" r="2.5" fill="#1F2937" />
            <circle cx="52" cy="44.5" r="1.2" fill="white" />

            {/* Mắt phải tròn đen lấp lánh */}
            <circle cx="73" cy="46" r="6" fill="white" stroke="#1F2937" strokeWidth="2" />
            <circle cx="72" cy="46" r="2.5" fill="#1F2937" />
            <circle cx="74" cy="44.5" r="1.2" fill="white" />
          </>
        );
    }
  };

  // Hàm vẽ miệng
  const renderMouth = () => {
    switch (emotion) {
      case "happy":
        return (
          <>
            <path
              d="M 56 56 Q 62 67 68 56 Z"
              fill="#E02424"
              stroke="#1F2937"
              strokeWidth="1.8"
            />
            <path d="M 59 59 Q 62 63 65 59 Z" fill="#FF85A2" />
          </>
        );
      case "panicking":
        return (
          <path
            d="M 57 58 Q 62 53 67 58 Q 62 61 57 58"
            fill="none"
            stroke="#1F2937"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case "cheering":
      case "neutral":
      default:
        return (
          <path
            d="M 57 55 Q 62 61 67 55"
            fill="none"
            stroke="#1F2937"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
    }
  };

  // Hàm vẽ tay chân tương ứng với cảm xúc
  const renderLimbs = () => {
    switch (emotion) {
      case "happy":
        return (
          <>
            {/* Tay trái giơ cao lên trời phấn khởi */}
            <path d="M 36 62 Q 22 50 25 38" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            {/* Tay phải giơ cao phấn khởi */}
            <path d="M 88 62 Q 102 50 99 38" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case "cheering":
        return (
          <>
            {/* Tay trái vẫy chào mừng */}
            <path d="M 36 62 Q 20 54 23 42" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            {/* Tay phải để tự nhiên */}
            <path d="M 88 62 Q 100 70 102 82" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case "panicking":
        return (
          <>
            {/* Hai tay ôm lấy mặt hoảng hốt */}
            <path d="M 36 62 Q 44 54 41 46" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            <path d="M 88 62 Q 80 54 83 46" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            {/* Giọt mồ hôi rơi lo lắng */}
            <path d="M 18 42 Q 18 36 20 36 Q 22 36 20 42 Z" fill="#3B82F6" />
            <path d="M 104 42 Q 104 36 102 36 Q 100 36 102 42 Z" fill="#3B82F6" />
          </>
        );
      case "neutral":
      default:
        return (
          <>
            {/* Hai tay buông thõng đáng yêu */}
            <path d="M 36 62 Q 22 70 20 82" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
            <path d="M 88 62 Q 102 70 104 82" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. Hai chân bé tí ở dưới đáy quả bơ */}
      <path
        d="M 48 102 L 44 114"
        stroke="#1F2937"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 76 102 L 80 114"
        stroke="#1F2937"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 2. Cánh tay bơ sữa */}
      {renderLimbs()}

      {/* 3. Vỏ quả bơ (Outer Skin) - Hình dáng quả lê/quả bơ */}
      <path
        d="M 62 26 
           C 44 26, 42 50, 32 74 
           C 22 96, 40 106, 62 106 
           C 84 106, 102 96, 92 74 
           C 82 50, 80 26, 62 26 Z"
        fill={outerSkinColor}
        stroke="#1F2937"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 4. Thịt quả bơ xanh nhạt bơ sữa (Inner Flesh) */}
      <path
        d="M 62 31 
           C 47 31, 45 52, 36 74 
           C 28 92, 44 101, 62 101 
           C 80 101, 96 92, 88 74 
           C 79 52, 77 31, 62 31 Z"
        fill={innerFleshColor}
      />

      {/* 5. Chiếc hột bơ nâu tròn trịa (Avocado Seed) đóng vai trò cái bụng xinh xắn */}
      <circle
        cx="62"
        cy="80"
        r="14"
        fill={seedColor}
        stroke="#1F2937"
        strokeWidth="2"
      />
      {/* Vệt bóng sáng trên hột bơ đặng nhìn 3D hơn */}
      <ellipse
        cx="58"
        cy="76"
        rx="4"
        ry="3"
        fill={seedHighlight}
        opacity="0.5"
        transform="rotate(-15 58 76)"
      />

      {/* Má hồng dễ thương */}
      <circle cx="43" cy="54" r="3" fill="#FFAEAE" />
      <circle cx="81" cy="54" r="3" fill="#FFAEAE" />

      {/* 6. Mắt và miệng trên phần thịt bơ phía trên hột */}
      {renderEyes()}
      {renderMouth()}

      {/* 7. Chiếc Nón Lá miền Tây che nắng mưa cho Bé Bơ Sữa */}
      <g>
        {/* Chóp nón tam giác dẹt vừa vặn trên đầu quả bơ */}
        <path
          d="M 62 14 L 40 32 L 84 32 Z"
          fill={hatColor}
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Vành nón lá */}
        <ellipse
          cx="62"
          cy="32"
          rx="22"
          ry="4"
          fill={hatColor}
          stroke="#1F2937"
          strokeWidth="2.5"
        />
        {/* Gân nón lá */}
        <path
          d="M 62 14 L 46 32 M 62 14 L 54 32 M 62 14 L 70 32 M 62 14 L 78 32"
          stroke={hatBorder}
          strokeWidth="1.5"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
