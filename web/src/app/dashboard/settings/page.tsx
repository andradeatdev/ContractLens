"use client";

import { useState, useEffect } from "react";
import { Settings, ChevronRight, User, Bell, Lock, Mail, Save, Loader2, AlertCircle } from "lucide-react";
import { DirectionalTransition } from "@/components/view-transition-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/modal-provider";
import { subscribeToPush } from "@/lib/push";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialProfile, setInitialProfile] = useState<ProfileInput | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const modal = useModal();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const handlePushToggle = async () => {
    if (pushEnabled) {
      modal.alert({
        title: "Desativar notificações",
        message: "Para desativar completamente, você deve remover a permissão nas configurações do seu navegador.",
        type: "info"
      });
      return;
    }

    const sub = await subscribeToPush();
    if (sub) setPushEnabled(true);
  };

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const checkIsDirty = () => {
    if (!initialProfile) return false;
    const values = getValues();
    return values.name !== initialProfile.name || 
           values.email !== initialProfile.email;
  };

  const isDirty = checkIsDirty();

  // Carregar dados reais do backend ao montar a página
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Erro ao carregar perfil");
        const data = await res.json();
        const userData = {
          name: data.name,
          email: data.email
        };
        setInitialProfile(userData);
        reset(userData);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados do usuário.");
      } finally {
        setInitialLoading(false);
      }
    }
    fetchUser();
  }, [reset]);

  const onSubmit = async (values: ProfileInput) => {
    if (!isDirty) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar");
      }
      
      setInitialProfile(values);
      modal.alert({
        title: "Sucesso",
        message: "Configurações atualizadas com sucesso",
        type: "success"
      });
    } catch (err: unknown) {
      setError((err as Error).message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DirectionalTransition>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">App</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <h1 className="text-sm font-bold">Configurações</h1>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 animate-in fade-in zoom-in duration-200"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar alterações
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-muted/5 p-8">
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Preferências</h2>
              <p className="text-muted-foreground">Personalize sua experiência e gerencie sua conta.</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Seção: Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <h3 className="font-bold">Perfil</h3>
                <p className="text-sm text-muted-foreground">Informações públicas e dados de contato.</p>
              </div>
              <div className="md:col-span-2 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-background p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl">
                      <User className="h-10 w-10" />
                    </div>
                    <button type="button" className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-all">
                      Alterar foto
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nome</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-muted/10 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all",
                            errors.name ? "border-destructive focus:ring-destructive/10 pr-10" : "border-border"
                          )}
                          {...register("name")}
                        />
                        {errors.name && (
                          <div 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive cursor-help animate-in fade-in zoom-in duration-200"
                            title={errors.name.message}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border bg-muted/10 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all",
                            errors.email ? "border-destructive focus:ring-destructive/10 pr-10" : "border-border"
                          )}
                          {...register("email")}
                        />
                        {errors.email && (
                          <div 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive cursor-help animate-in fade-in zoom-in duration-200"
                            title={errors.email.message}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <hr className="border-border" />

            {/* Seção: Notificações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <h3 className="font-bold">Notificações</h3>
                <p className="text-sm text-muted-foreground">Escolha como deseja ser avisado sobre seus contratos.</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <SettingsToggle 
                  icon={<Bell />} 
                  title="Push Notifications" 
                  description="Receba alertas de análise concluída e riscos críticos no navegador." 
                  enabled={pushEnabled}
                  onChange={handlePushToggle}
                />
                <SettingsToggle 
                  icon={<Mail />} 
                  title="Avisos por Email" 
                  description="Receba resumos de análises e alertas diretamente na sua caixa de entrada. (Em breve)" 
                  disabled
                />
              </div>
            </div>
            
            <hr className="border-border" />

            {/* Seção: Segurança */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <h3 className="font-bold">Segurança</h3>
                <p className="text-sm text-muted-foreground">Proteja sua conta e seus dados.</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <button className="w-full flex items-center justify-between p-6 bg-background rounded-[1.5rem] border border-border hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors"><Lock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-bold">Autenticação em Duas Etapas</p>
                      <p className="text-xs text-muted-foreground">Recomendado para maior segurança</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-tighter">Desativado</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DirectionalTransition>
  );
}

function SettingsToggle({ 
  icon, 
  title, 
  description, 
  enabled = false,
  disabled = false,
  onChange
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  enabled?: boolean,
  disabled?: boolean,
  onChange?: () => void
}) {
  return (
    <div className={`flex items-center justify-between p-6 bg-background rounded-[1.5rem] border border-border transition-all group ${disabled ? 'cursor-not-allowed' : 'hover:border-primary/30'}`}>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button 
        disabled={disabled}
        onClick={onChange}
        className={`h-6 w-11 rounded-full transition-colors relative shadow-inner cursor-pointer ${enabled ? 'bg-primary' : 'bg-muted'} ${disabled ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform shadow-sm ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
