import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    {
                        "bg-primary text-black hover:scale-105": variant === "default",
                        "border border-white/20 hover:border-white text-white bg-transparent": variant === "outline",
                        "text-white hover:bg-white/10": variant === "ghost",
                        "h-10 px-8 py-2": size === "default",
                        "h-8 px-4 text-sm": size === "sm",
                        "h-12 px-10 text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
