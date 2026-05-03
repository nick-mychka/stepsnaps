import type * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";

interface SimpleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  contentClassName?: string;
}

export function SimpleDialog({
  open,
  onOpenChange,
  children,
  contentClassName,
}: SimpleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>{children}</DialogContent>
    </Dialog>
  );
}

interface SimpleDialogContentProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function SimpleDialogContent({
  title,
  description,
  footer,
  children,
}: SimpleDialogContentProps) {
  const hasHeader = Boolean(title) || Boolean(description);

  return (
    <>
      {hasHeader && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}

      {children}

      {footer && <DialogFooter>{footer}</DialogFooter>}
    </>
  );
}
