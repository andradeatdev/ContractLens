import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  userName: string;
  validationCode: string;
}

export const VerificationEmail = ({
  userName,
  validationCode,
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Seu código de verificação: {validationCode}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 px-5 max-w-[580px]">
            <Section className="mb-8 text-center">
              <Heading className="text-2xl font-bold text-gray-900 mb-4 text-left">
                Olá, {userName}!
              </Heading>
              <Text className="text-gray-700 text-base leading-relaxed mb-6 text-left">
                Obrigado por se cadastrar no Contract Lens. Use o código de verificação abaixo para ativar sua conta:
              </Text>
              
              <div className="bg-gray-100 rounded-2xl py-8 px-4 mb-8">
                <Text className="text-4xl font-mono font-bold tracking-[10px] text-[#0070f3] m-0">
                  {validationCode}
                </Text>
              </div>

              <Text className="text-gray-500 text-sm text-left">
                Insira este código na página de registro para concluir seu cadastro.
              </Text>
              
              <Text className="text-gray-500 text-xs mt-10 text-left border-t border-gray-100 pt-6">
                Este código expira em 24 horas. Se você não criou uma conta, ignore este e-mail.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;
