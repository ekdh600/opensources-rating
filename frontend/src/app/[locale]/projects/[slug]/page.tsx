"use client";

import { use } from "react";
import { FigmaProjectDetailPage } from "@/components/project/FigmaProjectDetailPage";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <FigmaProjectDetailPage slug={slug} />;
}
