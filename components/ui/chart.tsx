"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip, type TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>

const ChartContext = React.createContext<ChartConfig>({})

function ChartContainer({
  id,
  config,
  className,
  children,
}: React.ComponentProps<"div"> & {
  id?: string
  config: ChartConfig
  children: React.ReactNode
}) {
  const generatedId = React.useId()
  const chartId = `chart-${id ?? generatedId.replace(/:/g, "")}`
  return (
    <ChartContext.Provider value={config}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-auto justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke]]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-reference-line_[stroke]]:stroke-border",
          className
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & { formatter?: (value: number) => React.ReactNode }) {
  const config = React.useContext(ChartContext)
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-1 text-xs font-medium">{String(label ?? "")}</p>
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? index)
        const entry = config[key]
        const value = Number(item.value ?? 0)
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-[2px]" style={{ background: item.color ?? entry?.color }} />
            <span className="text-muted-foreground">{entry?.label ?? item.name ?? key}</span>
            <strong className="ml-auto pl-4 tabular-nums">{formatter ? formatter(value) : value.toLocaleString()}</strong>
          </div>
        )
      })}
    </div>
  )
}

function ChartTooltip(props: TooltipProps<number, string> & { formatter?: (value: number) => React.ReactNode }) {
  return <Tooltip content={<ChartTooltipContent {...props} />} cursor={{ fill: "var(--muted)", opacity: 0.35 }} />
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig }
