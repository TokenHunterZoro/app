import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { pumpfunSample } from "@/lib/constants";
import { Moving } from "@/components/ui/acternity/moving";

const TikTokCarousel = () => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [positions, setPositions] = useState([0, 0, 0]);

  const thumbnails = pumpfunSample.results.pumpfun.videos.map(
    (video) => video.thumbnail_url
  );
  const itemHeight = 204; // Card height (192px) + gap (12px)
  const visibleHeight = 420; // Visible height of the container
  const totalHeight = itemHeight * thumbnails.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos, idx) => {
          if (hoveredColumn === idx) return pos; // Pause scrolling when hovered

          const direction = idx % 2 === 0 ? 1 : -1; // Alternate scroll direction
          let newPos = pos + direction;

          // Reset position when scrolling beyond limits
          if (newPos > totalHeight) {
            newPos = -visibleHeight;
          } else if (newPos < -totalHeight) {
            newPos = 0;
          }
          return newPos;
        })
      );
    }, 50); // Scrolling speed

    return () => clearInterval(interval);
  }, [hoveredColumn, totalHeight, visibleHeight]);

  const renderColumn = (columnIdx: number) => {
    const style = {
      transform: `translateY(${positions[columnIdx]}px)`,
    };

    return (
      <div
        className="relative"
        onMouseEnter={() => setHoveredColumn(columnIdx)}
        onMouseLeave={() => setHoveredColumn(null)}
      >
        <div className="overflow-hidden h-[420px] w-full bg-white">
          <div style={style}>
            {[
              "/thumbnails/1.jpeg",
              "/thumbnails/2.jpeg",
              "/thumbnails/3.jpeg",
              "/thumbnails/1.jpeg",
              "/thumbnails/2.jpeg",
              "/thumbnails/3.jpeg",
              "/thumbnails/1.jpeg",
              "/thumbnails/2.jpeg",
              "/thumbnails/3.jpeg",
            ].map(
              (
                src,
                i // Duplicate array for smooth looping
              ) => (
                <Card
                  key={`${columnIdx}-${i}`}
                  className="overflow-hidden transition-transform mb-3 rounded-lg"
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${i}`}
                    className="w-full h-56 object-cover rounded-lg"
                  />
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[70%] lg:w-[60%] xl:w-[50%] max-w-5xl mx-auto px-4 py-12">
      <Moving />
    </div>
  );
};

export default TikTokCarousel;
