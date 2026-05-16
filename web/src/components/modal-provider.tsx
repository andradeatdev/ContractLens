"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
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
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalType = "alert" | "confirm" | "prompt";
type ModalSeverity = "default" | "destructive" | "success";

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalSeverity;
  onConfirm?: (value?: string) => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
  defaultValue?: string;
}

interface ModalContextType {
  alert: (options: ModalOptions) => void;
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

  const showAlert = (opts: ModalOptions) => {
    setOptions(opts);
    setModalType("alert");
    setIsOpen(true);
  };

  const showConfirm = (opts: ModalOptions) => {
    setOptions(opts);
    setModalType("confirm");
    setIsOpen(true);
  };

  const showPrompt = (opts: ModalOptions) => {
    setOptions(opts);
    setModalType("prompt");
    setIsOpen(true);
    setInputValue(opts.defaultValue || "");
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setOptions(null);
      setIsSubmitting(false);
    }, 200);
  };

  const handleConfirm = async () => {
    if (options?.onConfirm) {
      setIsSubmitting(true);
      try {
        await options.onConfirm(modalType === "prompt" ? inputValue : undefined);
        closeModal();
      } catch (err) {
        console.error("Erro no callback do modal:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      closeModal();
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    if (options?.onCancel) options.onCancel();
    closeModal();
  };

  const getIconContainerClass = () => {
    if (!options) return "";
    
    if (options.type === "destructive") {
      return "bg-destructive/10 text-destructive";
    }
    
    if (options.type === "success") {
      return "bg-emerald-500/10 text-emerald-500";
    }
    
    return "bg-primary/10 text-primary";
  };

  const getModalIcon = () => {
    if (!options) return null;
    if (options.type === "destructive") return <AlertCircle className="h-5 w-5" />;
    if (options.type === "success") return <CheckCircle2 className="h-5 w-5" />;
    if (modalType === "confirm") return <HelpCircle className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  return (
    <ModalContext.Provider value={{ alert: showAlert, confirm: showConfirm, prompt: showPrompt, closeModal }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-background/80 backdrop-blur-xl border border-border shadow-none rounded-[2rem] [&>button]:hidden">
          {options && (
            <div className="p-6 pb-0">
              <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "rounded-full p-2 shrink-0",
                    getIconContainerClass()
                  )}>
                    {getModalIcon()}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleCancel}
                    className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
              </div>
              <DialogHeader className="text-left space-y-1 pr-4">
                  <DialogTitle className="text-lg font-bold">{options.title}</DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                    {options.message}
                  </DialogDescription>
              </DialogHeader>

              {/* Prompt Input */}
              {modalType === "prompt" && (
                <div className="w-full pt-6">
                  <Input
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={options.placeholder}
                    className="w-full h-12 rounded-xl bg-background border-border focus:border-primary/50"
                    onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleConfirm()}
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions Footer */}
          {options && (
            <div className="p-6 pt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 bg-muted/20 mt-6">
                {(modalType === "confirm" || modalType === "prompt") && (
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl font-bold px-5 hover:bg-muted cursor-pointer"
                  >
                    {options.cancelLabel || "Cancelar"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant={options.type === "destructive" ? "destructive" : "default"}
                  onClick={handleConfirm}
                  disabled={isSubmitting || (modalType === "prompt" && !inputValue.trim())}
                  className="h-12 rounded-xl font-bold px-6 gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {options.confirmLabel || (modalType === "alert" ? "Entendi" : "Confirmar")}
                </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal deve ser usado dentro de um ModalProvider");
  }
  return context;
}
