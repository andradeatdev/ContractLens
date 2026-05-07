import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação', () => {
  const randomEmail = `test-${Math.floor(Math.random() * 1000000)}@example.com`;

  test('deve realizar o cadastro e verificação com sucesso', async ({ page }) => {
    // 1. Acessar página de registro
    await page.goto('/register');
    
    // 2. Preencher formulário
    await page.fill('input[id="name"]', 'Usuário Teste E2E');
    await page.fill('input[id="email"]', randomEmail);
    await page.fill('input[id="password"]', 'SenhaForte123!');
    
    // 3. Submeter
    await page.click('button:has-text("Criar minha conta")');
    
    // 4. Verificar se chegou na tela de OTP
    await expect(page.locator('text=Verifique seu e-mail')).toBeVisible();
    await expect(page.locator(`text=${randomEmail}`)).toBeVisible();
    
    // 5. Preencher o código mestre (000000)
    // O componente InputOTP geralmente foca no primeiro slot automaticamente
    // Vamos preencher um por um ou usar o teclado
    const otpInput = page.locator('input[type="text"]').first();
    await otpInput.fill('000000');
    
    // 6. Verificar redirecionamento para o dashboard
    // A verificação é automática ao preencher o 6º dígito no componente
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('deve realizar login com o usuário recém criado', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[id="email"]', randomEmail);
    await page.fill('input[id="password"]', 'SenhaForte123!');
    
    await page.click('button:has-text("Entrar")');
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
