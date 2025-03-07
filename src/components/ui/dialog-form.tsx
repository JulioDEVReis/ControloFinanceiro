import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface DialogFormProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DialogForm({
  title,
  isOpen,
  onClose,
  children,
}: DialogFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-[#C9DDEE]">
        <DialogHeader>
          <DialogTitle className="text-[#27568B]">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
