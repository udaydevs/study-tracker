import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding font-sans text-sm font-semibold whitespace-nowrap outline-none select-none transition-[background-color,transform,box-shadow] duration-200 ease-out focus-visible:ring-3 focus-visible:ring-plum/40 active:not-aria-[haspopup]:scale-[.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-white hover:bg-night",

        brand:
          "bg-plum text-white hover:bg-plum-ink",

        outline:
          "border-line-2 bg-card text-ink hover:bg-plum-soft hover:text-plum-ink aria-expanded:bg-plum-soft",

        secondary:
          "bg-plum-soft text-plum-ink hover:bg-plum-soft/80",

        ghost:
          "text-ink hover:bg-plum-soft hover:text-plum-ink aria-expanded:bg-plum-soft",

        destructive:
          "bg-red-500/10 text-red-600 hover:bg-red-500/20 focus-visible:ring-red-500/30",

        link:
          "text-plum-ink underline-offset-4 hover:underline",
      },

      size: {
        default:
          "h-10 gap-2 px-4",

        xs:
          "h-7 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",

        lg:
          "h-12 gap-2 px-6 text-base",

        icon:
          "size-10",

        "icon-xs":
          "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-lg",

        "icon-lg":
          "size-12",
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