"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModalType = "alert" | "confirm" | "prompt";

interface ModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm?: (value?: string) => void | Promise<void>;
  onCancel?: () => void;
  type?: "default" | "destructive" | "success";
}

interface ModalContextType {
  alert: (options: Omit<ModalOptions, "onConfirm" | "onCancel" | "defaultValue" | "placeholder">) => void;
  confirm: (options: ModalOptions) => void;
  prompt: (options: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("alert");
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setOptions(null);
    setInputValue("");
    setIsSubmitting(false);
  }, [isSubmitting]);

  const showAlert = useCallback((opts: Omit<ModalOptions, "onConfirm" | "onCancel" | "defaultValue" | "placeholder">) => {
    setModalType("alert");
    setOptions({ ...opts, confirmLabel: opts.confirmLabel || "Entendido" });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((opts: ModalOptions) => {
    setModalType("confirm");
    setOptions({ 
      ...opts, 
      confirmLabel: opts.confirmLabel || "Confirmar", 
      cancelLabel: opts.cancelLabel || "Cancelar" 
    });
    setIsOpen(true);
  }, []);

  const showPrompt = useCallback((opts: ModalOptions) => {
    setModalType("prompt");
    setInputValue(opts.defaultValue || "");
    setOptions({ 
      ...opts, 
      confirmLabel: opts.confirmLabel || "Salvar", 
      cancelLabel: opts.cancelLabel || "Cancelar" 
    });
    setIsOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!options) return;
    
    if (options.onConfirm) {
      setIsSubmitting(true);
      try {
        await options.onConfirm(modalType === "prompt" ? inputValue : undefined);
        setIsOpen(false);
      } catch (error) {
        console.error("Modal confirm error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    if (options?.onCancel) options.onCancel();
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ alert: showAlert, confirm: showConfirm, prompt: showPrompt, closeModal }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-md p-6 gap-6">
          {options && (
            <>
              <DialogHeader className="text-left flex flex-row items-start gap-4 space-y-0">
                <div className={cn(
                  "mt-1 rounded-full p-2 shrink-0",
                  options.type === "destructive" ? "bg-destructive/10 text-destructive" : 
                  options.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                )}>
                  {options.type === "destructive" ? <AlertCircle className="h-5 w-5" /> : 
                   options.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : 
                   modalType === "confirm" ? <HelpCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div className="space-y-1 pr-4">
                  <DialogTitle className="text-lg font-bold">{options.title}</DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    {options.message}
                  </DialogDescription>
                </div>
              </DialogHeader>

              {/* Prompt Input */}
              {modalType === "prompt" && (
                <div className="w-full px-1">
                  <Input
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={options.placeholder}
                    className="w-full h-10"
                    onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleConfirm()}
                  />
                </div>
              )}

              {/* Actions Footer */}
              <DialogFooter className="flex sm:justify-end gap-2 sm:gap-2">
                {(modalType === "confirm" || modalType === "prompt") && (
                  <Button
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={handleCancel}
                    className="h-10 px-4 font-bold"
                  >
                    {options.cancelLabel}
                  </Button>
                )}
                <Button
                  disabled={isSubmitting}
                  onClick={handleConfirm}
                  variant={options.type === "destructive" ? "destructive" : "default"}
                  className={cn(
                    "h-10 px-4 min-w-[100px] font-bold shadow-sm",
                    options.type !== "destructive" && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : options.confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
