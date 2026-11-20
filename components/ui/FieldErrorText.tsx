type FieldErrorTextProps = {
  errors: unknown[];
  show?: boolean;
  id?: string;
};

/*
 * Renders TanStack Form field errors the same way the reference forms do.
 */
export function FieldErrorText({ errors, show = true, id }: FieldErrorTextProps) {
  if (!show || errors.length === 0) return null;

  return (
    <div id={id} role="alert" className="space-y-0.5">
      {errors.map((error, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: error messages can repeat
        <p key={index} className="text-xs text-destructive">
          {typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error)}
        </p>
      ))}
    </div>
  );
}
