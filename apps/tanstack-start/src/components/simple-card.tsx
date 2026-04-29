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
  action?: React.ReactNode;

  children?: React.ReactNode;

  footer?: React.ReactNode;

  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function SimpleCard({
  title,
  description,
  action,
  children,
  footer,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  footerClassName,
}: SimpleCardProps) {
  const hasHeader = title != null || description != null || action != null;

  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader className={headerClassName}>
          {title != null && (
            <CardTitle className={titleClassName}>{title}</CardTitle>
          )}
          {description != null && (
            <CardDescription className={descriptionClassName}>
              {description}
            </CardDescription>
          )}
          {action != null && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}

      {children != null && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}

      {footer != null && (
        <CardFooter className={footerClassName}>{footer}</CardFooter>
      )}
    </Card>
  );
}
