import type * as React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";

interface SimpleCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionSlot?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  onClick?: () => void;
}

export function SimpleCard({
  title,
  description,
  actionSlot,
  children,
  footer,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  footerClassName,
  onClick,
}: SimpleCardProps) {
  const hasHeader =
    Boolean(title) || Boolean(description) || Boolean(actionSlot);

  return (
    <Card className={className} onClick={onClick}>
      {hasHeader && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle className={titleClassName}>{title}</CardTitle>}
          {description && (
            <CardDescription className={descriptionClassName}>
              {description}
            </CardDescription>
          )}
          {actionSlot && <CardAction>{actionSlot}</CardAction>}
        </CardHeader>
      )}

      {children && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}

      {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
    </Card>
  );
}
