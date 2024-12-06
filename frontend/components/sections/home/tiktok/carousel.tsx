import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

const TikTokCarousel = () => {
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [positions, setPositions] = useState([0, 0, 0]);
  const thumbnails = Array(15).map((_, i) => `/samples/${i}.png`);
  const itemHeight = 204; // Card height (192px) + gap (12px)
  const totalHeight = itemHeight * thumbnails.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos, idx) => {
          if (hoveredColumn === idx) return pos;
          const direction = idx % 2 === 0 ? 1 : -1;
          const newPos = pos + direction;

          // For second column (idx 1), reset to totalHeight when reaching bottom
          if (idx === 1 && newPos <= -totalHeight) {
            return totalHeight;
          }
          // For other columns, reset to 0
          if (Math.abs(newPos) >= totalHeight) {
            return 0;
          }
          return newPos;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [hoveredColumn, totalHeight]);

  const renderColumn = (columnIdx: any) => {
    const style = {
      transform: `translateY(${-positions[columnIdx]}px)`,
      transition: "transform 0.5s linear",
    };

    return (
      <div
        className="relative"
        onMouseEnter={() => setHoveredColumn(columnIdx)}
        onMouseLeave={() => setHoveredColumn(null)}
      >
        <div className="overflow-hidden h-[420px]">
          <div style={style}>
            {[...thumbnails, ...thumbnails].map((src, i) => (
              <Card
                key={i}
                className="overflow-hidden transition-transform hover:scale-105 mb-3 rounded-lg"
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-56 object-cover rounded-lg"
                />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => renderColumn(i))}
      </div>
    </div>
  );
};

export default TikTokCarousel;
