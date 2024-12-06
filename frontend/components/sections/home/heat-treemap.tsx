import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Sample data - replace with your actual data
const sampleData = {
  name: "Memecoins",
  children: [
    {
      name: "High Cap",
      children: [
        { name: "DOGE", size: 400, velocity: 45 },
        { name: "SHIB", size: 350, velocity: 30 },
        { name: "PEPE", size: 300, velocity: 55 },
      ],
    },
    {
      name: "Mid Cap",
      children: [
        { name: "FLOKI", size: 250, velocity: 25 },
        { name: "WOJAK", size: 200, velocity: 40 },
        { name: "BONK", size: 180, velocity: 15 },
      ],
    },
    {
      name: "Low Cap",
      children: [
        { name: "MEME1", size: 150, velocity: 60 },
        { name: "MEME2", size: 120, velocity: 20 },
        { name: "MEME3", size: 100, velocity: 10 },
      ],
    },
  ],
};

const TreemapCell = ({ data, x, y, width, height }: any) => {
  const getColor = (velocity: any) => {
    // Red intensity based on velocity
    const intensity = Math.min(255, Math.floor((velocity / 60) * 255));
    return `rgb(${255}, ${255 - intensity}, ${255 - intensity})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute border border-gray-200 overflow-hidden"
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundColor: getColor(data.velocity),
      }}
    >
      <div className="p-2 text-sm">
        <div className="font-bold truncate">{data.name}</div>
        <div className="text-xs opacity-75">
          Mentions: {data.size}
          <br />
          Velocity: +{data.velocity}/h
        </div>
      </div>
    </motion.div>
  );
};

const TreemapLayout = ({ data, width, height }: any) => {
  // Simple treemap layout algorithm
  const layout = (node: any, x0: any, y0: any, x1: any, y1: any) => {
    if (node.children) {
      // Parent node - divide space among children
      const totalSize = node.children.reduce(
        (sum: any, child: any) => sum + (child.size || 0),
        0
      );
      let currentX = x0;
      let currentY = y0;

      return node.children.map((child: any) => {
        const childSize = child.size || 0;
        const ratio = childSize / totalSize;
        const childWidth = (x1 - x0) * ratio;
        const childHeight = y1 - y0;

        const result = {
          ...child,
          x: currentX,
          y: currentY,
          width: childWidth,
          height: childHeight,
        };

        currentX += childWidth;
        return result;
      });
    }
    return [];
  };

  // Calculate layout for all nodes
  const nodes = layout(data, 0, 0, width, height);

  return (
    <div className="relative" style={{ width, height }}>
      {nodes.map((node: any, index: any) => (
        <TreemapCell
          key={node.name}
          data={node}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
        />
      ))}
    </div>
  );
};

const MemecoinsTreemap = () => {
  const [timeframe, setTimeframe] = useState("1h");

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">
          Memecoin Mentions Heatmap
        </CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="3h">Last 3 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <TreemapLayout data={sampleData} width={800} height={600} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MemecoinsTreemap;
