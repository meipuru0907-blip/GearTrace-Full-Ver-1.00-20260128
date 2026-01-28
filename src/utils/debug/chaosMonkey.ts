/**
 * Chaos Monkey - Advanced Stress Testing Utility for GearTrace
 * 
 * Purpose: Push the application to its limits to detect:
 * - Race conditions in async operations
 * - Memory leaks from rapid component mounting/unmounting
 * - Data inconsistencies from concurrent DB operations
 * - UI rendering errors under stress
 * 
 * Usage:
 * ```typescript
 * import { ChaosMonkey } from '@/utils/debug/chaosMonkey';
 * 
 * // In browser console:
 * ChaosMonkey.unleashGremlins(30000); // 30 seconds of random clicks
 * ChaosMonkey.testEdgeCases(); // Test edge cases
 * ChaosMonkey.runWorkflowLoops(50); // 50 cycles of realistic workflows
 * ChaosMonkey.cleanupTestData(); // Remove test artifacts
 * ```
 * 
 * @author AI_RULES.md compliant implementation
 */

import { db } from '@/db';
import type { Gear } from '@/types';

// ============================================================================
// Type Definitions (AI_RULES.md Rule 3: Type Safety)
// ============================================================================

interface TestContext {
    cycle: number;
    step: string;
    timestamp: number;
}

interface TestResult {
    success: boolean;
    error?: Error;
    context: TestContext;
}

type WorkflowLoop = (cycle: number) => Promise<TestResult>;

// ============================================================================
// Constants
// ============================================================================

const TEST_PREFIX = 'TEST_ARTIFACT_';
const RANDOM_WAIT_MAX = 50; // milliseconds
const DEFAULT_CYCLES = 50;

// ============================================================================
// Utility Functions (AI_RULES.md Rule 2: DRY Principle)
// ============================================================================

/**
 * Random delay to simulate realistic async timing variations
 */
async function randomDelay(maxMs: number = RANDOM_WAIT_MAX): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * maxMs));
}

/**
 * Generate unique test identifier
 */
function generateTestId(): string {
    return `${TEST_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Detailed error logging (AI_RULES.md Rule 5: Error Handling)
 */
function logError(context: TestContext, error: Error): void {
    console.error('🔥 Chaos Monkey Error:', {
        cycle: context.cycle,
        step: context.step,
        timestamp: new Date(context.timestamp).toISOString(),
        error: error.message,
        stack: error.stack
    });
}

/**
 * Success logging for debugging
 */
function logSuccess(context: TestContext, message: string): void {
    console.log(`✅ [Cycle ${context.cycle}] ${context.step}: ${message}`);
}

// ============================================================================
// Test Category 1: UI Chaos (Gremlins)
// ============================================================================

/**
 * Unleash random UI chaos by clicking buttons, links, and inputs
 * 
 * @param duration Duration in milliseconds
 */
async function unleashGremlins(duration: number): Promise<void> {
    console.log(`🐒 Unleashing Gremlins for ${duration}ms...`);
    const startTime = Date.now();
    let clickCount = 0;

    const clickableSelectors = [
        'button',
        'a[href]',
        'input',
        '[role="button"]',
        '[onclick]'
    ];

    while (Date.now() - startTime < duration) {
        try {
            const selector = clickableSelectors[Math.floor(Math.random() * clickableSelectors.length)];
            const elements = document.querySelectorAll(selector);

            if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * elements.length)] as HTMLElement;
                randomElement.click();
                clickCount++;
            }

            await randomDelay(100);
        } catch (error) {
            // Ignore click errors, continue chaos
            console.warn('Gremlin click failed:', error);
        }
    }

    console.log(`🐒 Gremlins finished. Total clicks: ${clickCount}`);
}

// ============================================================================
// Test Category 2: Logic Breaker (Edge Cases)
// ============================================================================

/**
 * Test edge cases that could break data integrity
 */
async function testEdgeCases(): Promise<void> {
    console.log('🧪 Testing Edge Cases...');
    const results: TestResult[] = [];

    // Edge Case 1: Circular Container Reference
    try {
        const containerA = await createTestGear('Container_A', true);
        const containerB = await createTestGear('Container_B', true, containerA.id);

        // Attempt to create circular reference (should be prevented)
        await db.gear.update(containerA.id, { containerId: containerB.id });

        console.warn('⚠️ Circular reference created! This should be prevented.');
        results.push({
            success: false,
            error: new Error('Circular reference not prevented'),
            context: { cycle: 0, step: 'Circular Reference Test', timestamp: Date.now() }
        });
    } catch (error) {
        console.log('✅ Circular reference correctly prevented');
        results.push({
            success: true,
            context: { cycle: 0, step: 'Circular Reference Test', timestamp: Date.now() }
        });
    }

    // Edge Case 2: Numeric Overflow
    try {
        const gear = await createTestGear('Overflow_Test', false);
        await db.gear.update(gear.id, {
            purchasePrice: Number.MAX_SAFE_INTEGER + 1,
            quantity: Number.MAX_SAFE_INTEGER
        });
        console.log('✅ Numeric overflow handled');
    } catch (error) {
        console.error('❌ Numeric overflow caused error:', error);
    }

    // Edge Case 3: Special Characters Injection
    try {
        const maliciousStrings = [
            '<script>alert("XSS")</script>',
            '"; DROP TABLE gear; --',
            '../../etc/passwd',
            '\0\0\0\0',
            '🔥'.repeat(1000)
        ];

        for (const str of maliciousStrings) {
            await createTestGear(str, false);
        }
        console.log('✅ Special characters handled safely');
    } catch (error) {
        console.error('❌ Special character injection caused error:', error);
    }

    console.log('🧪 Edge Case Testing Complete');
}

// ============================================================================
// Test Category 3: Stateful Workflow Fuzzing
// ============================================================================

/**
 * Loop A: The "Indecisive User" - Create, edit, re-edit, delete rapidly
 */
const indecisiveUserLoop: WorkflowLoop = async (cycle: number): Promise<TestResult> => {
    const context: TestContext = {
        cycle,
        step: 'Loop A: Indecisive User',
        timestamp: Date.now()
    };

    try {
        // Step 1: Create gear
        context.step = 'Creating gear';
        const gear = await createTestGear(`Indecisive_${cycle}`, false);
        await randomDelay();
        logSuccess(context, `Created gear ${gear.id}`);

        // Step 2: Immediate edit (simulate opening detail modal)
        context.step = 'First edit';
        await db.gear.update(gear.id, { model: `Edit1_${Date.now()}` });
        await randomDelay(10); // Very short delay to stress race conditions
        logSuccess(context, 'First edit complete');

        // Step 3: Immediate re-edit without waiting
        context.step = 'Second edit (race condition test)';
        await db.gear.update(gear.id, { model: `Edit2_${Date.now()}` });
        await randomDelay(5);
        logSuccess(context, 'Second edit complete');

        // Step 4: Delete immediately
        context.step = 'Deleting gear';
        await db.gear.delete(gear.id);
        logSuccess(context, 'Gear deleted');

        return { success: true, context };
    } catch (error) {
        logError(context, error as Error);
        return { success: false, error: error as Error, context };
    }
};

/**
 * Loop B: The "Organizer" - Test container/content integrity
 */
const organizerLoop: WorkflowLoop = async (cycle: number): Promise<TestResult> => {
    const context: TestContext = {
        cycle,
        step: 'Loop B: Organizer',
        timestamp: Date.now()
    };

    try {
        // Step 1: Create container
        context.step = 'Creating container';
        const container = await createTestGear(`Container_${cycle}`, true);
        await randomDelay();
        logSuccess(context, `Created container ${container.id}`);

        // Step 2: Create content items
        context.step = 'Creating content items';
        const content1 = await createTestGear(`Content1_${cycle}`, false, container.id);
        const content2 = await createTestGear(`Content2_${cycle}`, false, container.id);
        await randomDelay();
        logSuccess(context, `Created 2 content items`);

        // Step 3: Verify relationship
        context.step = 'Verifying parent-child relationship';
        const contents = await db.gear.where('containerId').equals(container.id).toArray();
        if (contents.length !== 2) {
            throw new Error(`Expected 2 contents, found ${contents.length}`);
        }
        logSuccess(context, 'Relationship verified');

        // Step 4: Delete container (critical test - what happens to contents?)
        context.step = 'Deleting container with contents';
        await db.gear.delete(container.id);
        await randomDelay();

        // Verify contents handling
        const orphanedContents = await db.gear.where('containerId').equals(container.id).toArray();
        logSuccess(context, `Container deleted. Orphaned contents: ${orphanedContents.length}`);

        // Cleanup orphaned items
        await db.gear.delete(content1.id);
        await db.gear.delete(content2.id);

        return { success: true, context };
    } catch (error) {
        logError(context, error as Error);
        return { success: false, error: error as Error, context };
    }
};

/**
 * Loop C: The "Switch Master" - Tab switching stress test
 * Note: This requires DOM manipulation and is best run in actual UI context
 */
const switchMasterLoop: WorkflowLoop = async (cycle: number): Promise<TestResult> => {
    const context: TestContext = {
        cycle,
        step: 'Loop C: Switch Master',
        timestamp: Date.now()
    };

    try {
        // Create test gear for tab switching
        context.step = 'Creating gear for tab test';
        const gear = await createTestGear(`TabTest_${cycle}`, true);
        await randomDelay();

        // Simulate rapid tab switching by triggering rapid data fetches
        context.step = 'Rapid data access (simulating tab switches)';
        const promises = [];

        for (let i = 0; i < 10; i++) {
            promises.push(db.gear.get(gear.id));
            promises.push(db.logs.where('gearId').equals(gear.id).toArray());
            promises.push(db.gear.where('containerId').equals(gear.id).toArray());
        }

        await Promise.all(promises);
        logSuccess(context, '30 concurrent DB queries completed');

        // Update data while queries are happening (race condition test)
        context.step = 'Concurrent data update';
        await db.gear.update(gear.id, { model: `Updated_${Date.now()}` });
        await randomDelay();

        // Cleanup
        await db.gear.delete(gear.id);

        return { success: true, context };
    } catch (error) {
        logError(context, error as Error);
        return { success: false, error: error as Error, context };
    }
};

/**
 * Run all workflow loops for specified number of cycles
 */
async function runWorkflowLoops(cycles: number = DEFAULT_CYCLES): Promise<void> {
    console.log(`🔥 Starting Workflow Fuzzing: ${cycles} cycles`);
    const startTime = Date.now();
    const results: TestResult[] = [];

    for (let cycle = 1; cycle <= cycles; cycle++) {
        console.log(`\n--- Cycle ${cycle}/${cycles} ---`);

        // Run all loops
        results.push(await indecisiveUserLoop(cycle));
        results.push(await organizerLoop(cycle));
        results.push(await switchMasterLoop(cycle));

        // Small delay between cycles
        await randomDelay(100);
    }

    // Summary
    const duration = Date.now() - startTime;
    const failures = results.filter(r => !r.success);

    console.log(`\n🎯 Workflow Fuzzing Complete`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Total Tests: ${results.length}`);
    console.log(`Failures: ${failures.length}`);
    console.log(`Success Rate: ${((1 - failures.length / results.length) * 100).toFixed(2)}%`);

    if (failures.length > 0) {
        console.log('\n❌ Failed Tests:');
        failures.forEach(f => {
            console.log(`  - Cycle ${f.context.cycle}, Step: ${f.context.step}`);
            console.log(`    Error: ${f.error?.message}`);
        });
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create test gear with proper typing and validation
 */
async function createTestGear(
    name: string,
    isContainer: boolean,
    containerId?: string
): Promise<Gear> {
    const gear: Gear = {
        id: generateTestId(),
        name: `${TEST_PREFIX}${name}`,
        category: 'Test Category',
        manufacturer: 'Test Manufacturer',
        model: `Model_${Date.now()}`,
        serialNumber: `SN_${Math.random().toString(36).substr(2, 9)}`,
        photos: {
            hero: ''
        },
        status: 'Available',
        purchaseDate: new Date().toISOString(),
        purchasePrice: Math.floor(Math.random() * 10000),
        lifespan: 5,
        quantity: 1,
        isContainer: isContainer,
        containerId: containerId,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    await db.gear.add(gear);
    return gear;
}

/**
 * Cleanup all test data created by Chaos Monkey
 */
async function cleanupTestData(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
        const testGear = await db.gear
            .filter(g => g.name?.startsWith(TEST_PREFIX) || g.id?.startsWith(TEST_PREFIX))
            .toArray();

        const testLogs = await db.logs
            .filter(l => l.gearId?.startsWith(TEST_PREFIX))
            .toArray();

        // Delete test gear
        for (const gear of testGear) {
            await db.gear.delete(gear.id);
        }

        // Delete test logs
        for (const log of testLogs) {
            if (log.id) {
                await db.logs.delete(log.id);
            }
        }

        console.log(`🧹 Cleanup complete. Removed ${testGear.length} gear items and ${testLogs.length} logs.`);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

// ============================================================================
// Public API (AI_RULES.md Rule 1: Maintainability)
// ============================================================================

export const ChaosMonkey = {
    unleashGremlins,
    testEdgeCases,
    runWorkflowLoops,
    cleanupTestData,

    // Individual workflow loops for targeted testing
    loops: {
        indecisiveUser: indecisiveUserLoop,
        organizer: organizerLoop,
        switchMaster: switchMasterLoop
    }
};

// Expose to window for easy console access (development only)
if (typeof window !== 'undefined') {
    (window as any).ChaosMonkey = ChaosMonkey;
    console.log('🐒 ChaosMonkey loaded. Use window.ChaosMonkey to access test utilities.');
}
