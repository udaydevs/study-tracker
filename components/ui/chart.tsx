"use client"

import * as React from "react"
import { cn } from "cn"

type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>
function ChartContainer({ className, config, children, ...props }: React.ComponentProps<"div"> & { config: ChartConfig }) {
  return <div data-slot="chart" data-chart-config={Object.keys(config).join(",")} className={cn("w-full text-xs", className)} {...props}>{children}</div>
}
function ChartBar({ value, max, label, detail, className }: { value: number; max: number; label: string; detail: string; className?: string }) {
  const height = Math.max(value > 0 ? 3 : 2, Math.min(100, value / Math.max(1, max) * 100))
  return <div className={cn("group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2", className)} title={`${detail}: ${label}`}>
    <div className="flex h-full w-full items-end justify-center">
      <div className="w-[58%] min-w-[3px] rounded-t-md bg-[#6b3fd8]/90 transition-[height] duration-300 group-hover:bg-[#6b3fd8]" style={{ height: `${height}%` }} />
    </div>
    <span className="truncate text-[10px] text-[#777187]">{label}</span>
  </div>
}
function ChartGrid({ className, rows = 4 }: { className?: string; rows?: number }) {
  return <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 inset-y-0 flex flex-col justify-between", className)}>{Array.from({ length: rows }, (_, i) => <div key={i} className="border-t border-dashed border-[#dcd6e6]/70" />)}</div>
}
export { ChartContainer, ChartBar, ChartGrid, type ChartConfig }
