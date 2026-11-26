import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // base: Manrope semibold, 10px radius, soft press, volt focus ring (all from the --s3-* tokens)
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding font-sans text-sm font-semibold whitespace-nowrap outline-none select-none transition-[background-color,transform,box-shadow] duration-200 ease-[var(--s3-ease)] focus-visible:ring-3 focus-visible:ring-volt/40 active:not-aria-[haspopup]:scale-[.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // the dark pill-style button from the design
        default: "bg-foreground text-white hover:bg-night/85",
        // bright accent, used for the timer's Start button
        brand: "bg-volt text-white hover:bg-volt/90",
        outline:
          "border-[color:var(--s3-line-2)] bg-white text-ink hover:bg-plum-soft hover:text-plum-ink aria-expanded:bg-plum-soft",
        secondary:
          "bg-plum-soft text-plum-ink hover:bg-[color-mix(in_oklch,var(--s3-plum-soft),var(--s3-plum)_10%)]",
        ghost: "text-ink hover:bg-plum-soft hover:text-plum-ink aria-expanded:bg-plum-soft",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30",
        link: "text-plum-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }