import { cn } from "../lib/utils";
import { Button, ButtonProps } from "./button";
import { ReactNode } from "react";

export interface ButtonWithIconProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  iconPosition?: "left" | "right";
}

export function ButtonWithIcon({
  icon,
  children,
  iconPosition = "left",
  className,
  ...props
}: ButtonWithIconProps) {
  return (
    <Button
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {iconPosition === "left" && icon}
      <span>{children}</span>
      {iconPosition === "right" && icon}
    </Button>
  );
}
