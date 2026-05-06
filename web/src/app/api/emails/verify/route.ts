import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import VerificationEmail from "@/emails/verification-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { email, name, token } = await request.json();
    console.log(`[Email Service] Tentando enviar e-mail para: ${email}, nome: ${name}`);

    if (!email || !name || !token) {
      console.error("[Email Service] Falha: Campos obrigatórios ausentes");
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    console.log(`[Email Service] Enviando código OTP: ${token}`);

    const { data, error } = await resend.emails.send({
      from: "Contract Lens <onboarding@resend.dev>",
      to: [email],
      subject: "Seu código de verificação",
      react: VerificationEmail({ userName: name, validationCode: token }),
    });

    if (error) {
      console.error("[Email Service] Erro do Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[Email Service] E-mail enviado com sucesso via Resend:", data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[Email Service] Erro interno:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
