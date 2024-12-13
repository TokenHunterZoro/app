"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { pumpfunSample } from "@/lib/constants";

export function Moving() {
  return (
    <InfiniteMovingCards
      items={pumpfunSample.results.pumpfun.videos.map(
        (video) => video.thumbnail_url
      )}
      direction="right"
      speed="slow"
    />
  );
}
