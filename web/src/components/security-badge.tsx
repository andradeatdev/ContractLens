"use client";

import { ShieldCheck, Lock, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export function SecurityBadge() {
  const securityFeatures = [
    {
      icon: <Lock className="h-4 w-4" />,
      text: "Criptografia AES-256",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      text: "Conformidade GDPR",
    },
    {
      icon: <EyeOff className="h-4 w-4" />,
      text: "Privacidade Enterprise",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-16">
      {securityFeatures.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-default"
        >
          <span className="text-primary">{feature.icon}</span>
          {feature.text}
        </motion.div>
      ))}
    </div>
  );
}
