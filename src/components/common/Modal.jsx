import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, description, children, size = "md" }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousActive = document.activeElement;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeRef.current?.();
    };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousActive?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex w-full ${sizes[size] || sizes.md} max-h-[88dvh] flex-col overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_24px_70px_rgba(15,23,42,.22)] outline-none dark:border-slate-700 dark:bg-slate-900`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[17px] font-semibold tracking-[-.01em] text-slate-950 dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-1 -mt-1" aria-label="Close dialog"><X size={18}/></button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
      </section>
    </div>
  );
}
export default Modal;
