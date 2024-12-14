"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { pumpfunSample } from "@/lib/constants";

export function Moving() {
  return (
    <InfiniteMovingCards
      items={[
        "/thumbnails/1.jpeg",
        "/thumbnails/2.jpeg",
        "/thumbnails/3.jpeg",
        "/thumbnails/1.jpeg",
        "/thumbnails/2.jpeg",
        "/thumbnails/3.jpeg",
      ]}
      direction="right"
      speed="slow"
    />
  );
}
