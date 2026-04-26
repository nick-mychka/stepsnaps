import type * as React from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@stepsnaps/ui/empty";

interface SimpleEmptyProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export function SimpleEmpty({
  icon,
  title,
  description,
  contentClassName,
  children,
}: SimpleEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children && (
        <EmptyContent className={contentClassName}>{children}</EmptyContent>
      )}
    </Empty>
  );
}
