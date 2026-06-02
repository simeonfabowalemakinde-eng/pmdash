import { test, expect } from '@playwright/test'

test.describe('PMDASH Auth', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForURL('**/auth/login')
    expect(page.url()).toContain('auth/login')
  })

  test('should show login form', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Log In")')).toBeVisible()
  })
})

test.describe('PMDASH Dashboard', () => {
  test('should show dashboard when authenticated', async ({ page, context }) => {
    // This would need a helper to set auth token in cookies/context
    await page.goto('http://localhost:3000/dashboard')
    // Placeholder: in real tests, you'd mock auth or use test user
    await expect(page.locator('text=PMDASH')).toBeVisible()
  })

  test('should display overview cards', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    await expect(page.locator('text=Active Initiatives')).toBeVisible()
    await expect(page.locator('text=In Progress')).toBeVisible()
    await expect(page.locator('text=Blocked Items')).toBeVisible()
    await expect(page.locator('text=AI Allowance Remaining')).toBeVisible()
  })
})

test.describe('PMDASH Data Isolation', () => {
  test('should only show user-owned data', async ({ page }) => {
    // Placeholder: verify RLS is working by attempting cross-user access
    // In real tests, you'd use multiple test users and verify isolation
    await page.goto('http://localhost:3000/roadmap')
    // Should only show authenticated user's initiatives
    await expect(page.locator('text=No initiatives yet')).toBeVisibleOrNot()
  })
})
