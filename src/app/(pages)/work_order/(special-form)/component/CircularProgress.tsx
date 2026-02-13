import React from "react"

type CircularProgressProps = {
  value: number
  total: number
  size?: number
  strokeWidth?: number
  color?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
                                                    value, // ค่าปัจจุบัน
                                                    total,
                                                    size = 75, // ขนาดวงกลม
                                                    strokeWidth = 8, //ความหนาของเส้น
                                                    color = "#F9AC12", //สีของแถบความคืบหน้า
                                                  }) => {
  const radius = (size - strokeWidth) / 2 // รัศมีวงกลม
  const circumference = 2 * Math.PI * radius // เส้นรอบวง
  const progress = (value / total) * circumference // ความยาวแถบความคืบหน้า

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#FDE5B6"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference} //วงกลมความคืบหน้า เพื่อแสดงเปอร์เซ็นต์
        strokeDashoffset={circumference - progress} //ควบคุมความยาวเส้นที่แสดง
        strokeLinecap="round" //ปลายเส้นโค้งมน
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fill="#333"
        fontWeight="bold"
      >
        {value}/{total}
      </text>
    </svg>
  )
}
