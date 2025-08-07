import React, { useState, createContext, useContext } from "react";

// Button
export const Button = ({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "destructive", size?: "sm" }) => (
  <button
    className={[
      "px-4 py-2 rounded font-semibold transition",
      size === "sm" && "px-2 py-1 text-sm",
      variant === "outline" && "border border-gray-400 bg-white text-gray-800 hover:bg-gray-100",
      variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
      !variant && "bg-purple-600 text-white hover:bg-purple-700",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);

// Input
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
    {...props}
  />
));
Input.displayName = "Input";

// Textarea
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    ref={ref}
    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Dialog
const DialogContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = useContext(DialogContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement< any>;
  return React.cloneElement(child, {
    ...child.props,
    onClick: (e: React.MouseEvent) => {
      (child.props ).onClick?.(e);
      ctx.setOpen(true);
    },
  });
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  const ctx = useContext(DialogContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={() => ctx.setOpen(false)}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}