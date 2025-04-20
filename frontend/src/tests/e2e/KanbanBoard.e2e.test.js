// const { test, expect } = require('@playwright/test');

// test.describe('Kanban Board E2E', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto('http://localhost:3000');
//   });

//   test('creates a task in selected column', async ({ page }) => {
//     await page.click('text=Add Task');
//     await page.fill('label:has-text("Title") + input', 'Test Task');
//     await page.locator('.react-select__control').nth(2).click(); // Column dropdown (third Select)
//     await page.locator('.react-select__option:has-text("In Progress")').click();
//     await page.click('text=Create Task');
//     await expect(page.locator('h2:has-text("In Progress") ~ div input[value="Test Task"]')).toBeVisible();
//   });

//   test('updates task priority', async ({ page }) => {
//     await page.click('text=Add Task');
//     await page.fill('label:has-text("Title") + input', 'Test Task');
//     await page.click('text=Create Task');
//     await page.locator('.react-select__control').first().click();
//     await page.locator('.react-select__option:has-text("High")').click();
//     await expect(page.locator('text=High')).toBeVisible();
//   });

//   test('uploads a file', async ({ page }) => {
//     await page.click('text=Add Task');
//     await page.fill('label:has-text("Title") + input', 'Test Task');
//     await page.click('text=Create Task');
//     const fileInput = await page.locator('input[type="file"]');
//     await fileInput.setInputFiles({
//       name: 'test.png',
//       mimeType: 'image/png',
//       buffer: Buffer.from('fake-image-data'),
//     });
//     await expect(page.locator('img')).toBeVisible();
//   });

//   test('displays task progress chart', async ({ page }) => {
//     await page.click('text=Add Task');
//     await page.fill('label:has-text("Title") + input', 'Test Task');
//     await page.click('text=Create Task');
//     await expect(page.locator('canvas')).toBeVisible();
//   });
// });

const { test, expect } = require('@playwright/test');

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=Kanban Board');
  });

  test('user can create a task', async ({ page }) => {
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'New Task');
    await page.selectOption('select[name="column"]', 'To Do');
    await page.click('text=Create Task');
    await expect(page.locator('text=New Task')).toBeVisible();
  });

  test('user can drag and drop a task between columns', async ({ page }) => {
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'Draggable Task');
    await page.selectOption('select[name="column"]', 'To Do');
    await page.click('text=Create Task');
    await expect(page.locator('text=Draggable Task')).toBeVisible();

    const task = page.locator('text=Draggable Task').first();
    const sourceColumn = page.locator('.w-1/3').nth(0); // To Do column
    const targetColumn = page.locator('.w-1/3').nth(1); // In Progress column

    await task.dragTo(targetColumn);
    await expect(task).toBeVisible();
    await expect(targetColumn).toContainText('Draggable Task');
  });

  test('UI updates in real-time with multiple clients', async ({ browser }) => {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    await page1.goto('http://localhost:3000');
    await page2.goto('http://localhost:3000');

    await page1.click('text=Add Task');
    await page1.fill('input[name="title"]', 'Real-Time Task');
    await page1.selectOption('select[name="column"]', 'To Do');
    await page1.click('text=Create Task');

    await page2.waitForSelector('text=Real-Time Task', { state: 'visible' });
    await expect(page2.locator('text=Real-Time Task')).toBeVisible();
  });

  test('user can delete a task', async ({ page }) => {
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'Delete Me');
    await page.selectOption('select[name="column"]', 'To Do');
    await page.click('text=Create Task');
    await page.click('text=Delete');
    await expect(page.locator('text=Delete Me')).not.toBeVisible();
  });

  test('user can change task category', async ({ page }) => {
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'Category Task');
    await page.selectOption('select[name="category"]', 'Feature');
    await page.click('text=Create Task');
    await expect(page.locator('text=Category Task')).toBeVisible();

    await page.selectOption('select[name="category"]', 'Enhancement');
    await page.click('text=Create Task'); // Reuses modal, simulate save
    await page.reload();
    await expect(page.locator('text=Category Task')).toBeVisible();
  });

  test('user can upload a file and handle invalid files', async ({ page }) => {
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'File Task');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/test.png');
    await page.click('text=Create Task');
    await expect(page.locator('img')).toBeVisible();

    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'Invalid File Task');
    const invalidFileChooserPromise = page.waitForEvent('filechooser');
    await page.click('input[type="file"]');
    const invalidFileChooser = await invalidFileChooserPromise;
    await invalidFileChooser.setFiles('tests/fixtures/invalid.txt');
    await page.click('text=Create Task');
    await expect(page.locator('text=Unsupported file format')).toBeVisible();
  });

  test('graph updates task counts as tasks move', async ({ page }) => {
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'Graph Task 1');
    await page.selectOption('select[name="column"]', 'To Do');
    await page.click('text=Create Task');

    await page.click('text=Add Task');
    await page.fill('input[name="title"]', 'Graph Task 2');
    await page.selectOption('select[name="column"]', 'To Do');
    await page.click('text=Create Task');

    const task = page.locator('text=Graph Task 1').first();
    const sourceColumn = page.locator('.w-1/3').nth(0); // To Do
    const targetColumn = page.locator('.w-1/3').nth(1); // In Progress
    await task.dragTo(targetColumn);

    await expect(page.locator('canvas')).toBeVisible();
    // Note: Exact count verification requires accessing chart data, which is complex in Playwright
    // As a proxy, check for re-render
    await expect(page.locator('text=Completion')).toContainText('50.00');
  });
});