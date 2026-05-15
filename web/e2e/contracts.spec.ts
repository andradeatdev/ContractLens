import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Gerenciamento de Contratos', () => {
  // Usaremos o código mestre para bypass de login/OTP se necessário
  // Mas para E2E real, vamos simular o fluxo completo
  
  test('deve permitir upload, reanálise e exportação de contrato', async ({ page }) => {
    // 1. Login simplificado (se já tivermos um usuário ou criarmos um)
    const randomEmail = `test-contract-${Date.now().toString().slice(-6)}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[id="name"]', 'Usuário Contrato');
    await page.fill('input[id="email"]', randomEmail);
    await page.fill('input[id="password"]', 'Senha123!');
    await page.click('button:has-text("Criar minha conta")');
    
    await expect(page.locator('text=Verifique seu e-mail')).toBeVisible();
    await page.locator('input[type="text"]').first().fill('000000');
    
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Upload de Contrato
    // Criar um PDF fake para teste se não houver um
    const testFilePath = path.join(__dirname, 'test-contract.pdf');
    // Nota: Playwright pode não gostar de arquivos de texto fingindo ser PDF dependendo do validador do backend
    // Mas nosso extrator de PDF deve lidar com arquivos básicos.
    // Para ser seguro, vamos assumir que o ambiente tem um PDF real ou criar um buffer mínimo.
    fs.writeFileSync(testFilePath, '%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Enviar contrato');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    // Esperar processamento
    await expect(page.locator('text=Resumo Executivo')).toBeVisible({ timeout: 30000 });
    
    // 3. Reanálise
    await page.click('button[aria-haspopup="menu"]');
    await page.click('text=Reanalisar agora');
    await page.click('button:has-text("Sim, reanalisar")');
    
    await expect(page.locator('text=Análise atualizada')).toBeVisible();

    // 4. Exportação
    const downloadPromise = page.waitForEvent('download');
    await page.click('button[aria-haspopup="menu"]');
    await page.click('text=Exportar análise');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.md');
    
    // Limpar arquivo de teste local
    fs.unlinkSync(testFilePath);
  });
});
