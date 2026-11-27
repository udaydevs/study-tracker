import { cn } from "@/lib/utils"

function Progress({ className, value = 0, ...props }: React.ComponentProps<"div"> & { value?: number }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0))
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div data-slot="progress-indicator" className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
    </div>
  )
}
export { Progress }
