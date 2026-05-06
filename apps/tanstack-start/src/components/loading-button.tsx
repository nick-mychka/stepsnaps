import { Button } from "@stepsnaps/ui/button";
import { Spinner } from "@stepsnaps/ui/spinner";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

export function LoadingButton({
  loading = false,
  children,
  ...restProps
}: LoadingButtonProps) {
  return (
    <Button {...restProps}>
      {loading && <Spinner />}
      {children}
    </Button>
  );
}
