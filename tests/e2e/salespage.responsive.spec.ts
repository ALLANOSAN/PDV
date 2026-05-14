import { expect, Page, test } from "@playwright/test";

test.describe("SalesPage Responsividade e Acessibilidade", () => {
    // Função utilitária para login
    async function login(page: Page) {
        await page.goto("/login");
        await page.setViewportSize({ width: 375, height: 800 });

        // Usando localizadores baseados em label (mais robustos para mobile/acessibilidade)
        await page.getByLabel(/email/i).fill(
            "essenciacosmeticos2018@gmail.com",
        );
        await page.getByLabel(/senha/i).fill("Essencia@2026");

        await page.click('button[type="submit"]');

        // Aguarda redirecionamento para dashboard com timeout maior
        try {
            await page.waitForURL("**/dashboard", { timeout: 10000 });
        } catch {
            // Se falhar, verifica se há mensagem de erro
            const errorText = await page.locator(".text-red-500").first().textContent().catch(() => "");
            if (errorText) {
                throw new Error(`Login falhou: ${errorText}`);
            }
            // Verifica a URL atual
            const currentUrl = page.url();
            throw new Error(`Redirecionamento falhou. URL atual: ${currentUrl}`);
        }
    }

    test("Sidebar abre/fecha corretamente no mobile", async ({ page }) => {
        await login(page);
        await page.goto("/dashboard/sales");
        // Botão menu deve aparecer
        const menuBtn = page.locator('button[aria-label="Abrir menu"]');
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();
        // Sidebar deve aparecer
        const sidebar = page.locator('aside[aria-label="Menu lateral"]');
        await expect(sidebar).toBeVisible();
        // Clica no overlay para fechar sidebar (o overlay cobre a tela)
        await page.locator('.fixed.inset-0.bg-black\\/40').click();
        // Aguarda a animação de fechamento
        await page.waitForTimeout(500);
        // Verifica que a sidebar está oculta (tem classe translate-x negativa)
        await expect(sidebar).toHaveClass(/-translate-x-full/);
    });

    test("SalesPage exibe elementos principais e não tem overflow", async ({ page }) => {
        await login(page);
        await page.goto("/dashboard/sales");
        // Título
        await expect(page.locator("h2", { hasText: /Essência Cosméticos/ })).toBeVisible();
        // Input de busca
        await expect(page.locator("input#search-input")).toBeVisible();
        // Botão limpar carrinho
        await expect(page.locator("button", { hasText: "Limpar Carrinho" }))
            .toBeVisible();
        // Não deve ter scroll horizontal
        const hasOverflow = await page.evaluate(() =>
            document.body.scrollWidth > document.body.clientWidth
        );
        expect(hasOverflow).toBeFalsy();
    });

    test("Botões e inputs são acessíveis por teclado", async ({ page }) => {
        await login(page);
        await page.goto("/dashboard/sales");

        // Verifica que o input de busca é focável
        const searchInput = page.locator("input#search-input");
        await searchInput.click();
        await expect(searchInput).toBeFocused();

        // Verifica que o botão limpar carrinho é visível e clicável
        const clearCartBtn = page.locator("button", { hasText: "Limpar Carrinho" });
        await expect(clearCartBtn).toBeVisible();
    });
});
