"use client";

import { useState } from "react";

import type { MultiPerformerChartDataPoint } from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";

import { MultiPerformerChart } from "./multi-performer-chart";

interface MultiPerformerChartWrapperProps {
  data: MultiPerformerChartDataPoint[];
  allPerformers: string[];
  title: string;
  icon?: React.ReactNode;
  period?: PeriodFilter;
}

export function MultiPerformerChartWrapper({
  data,
  allPerformers,
  title,
  icon,
  period,
}: MultiPerformerChartWrapperProps) {
  const [selectedPerformers, setSelectedPerformers] = useState<Set<string>>(
    () => new Set(allPerformers),
  );

  const handleTogglePerformer = (performer: string) => {
    const newSelected = new Set(selectedPerformers);
    if (newSelected.has(performer)) {
      newSelected.delete(performer);
    } else {
      newSelected.add(performer);
    }
    setSelectedPerformers(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedPerformers(new Set(allPerformers));
  };

  const handleClearAll = () => {
    setSelectedPerformers(new Set());
  };

  const selectedArray = Array.from(selectedPerformers).sort();

  return (
    <MultiPerformerChart
      data={data}
      selectedPerformers={selectedArray}
      allPerformers={allPerformers}
      title={title}
      icon={icon}
      period={period}
      onTogglePerformer={handleTogglePerformer}
      onSelectAll={handleSelectAll}
      onClearAll={handleClearAll}
    />
  );
}
