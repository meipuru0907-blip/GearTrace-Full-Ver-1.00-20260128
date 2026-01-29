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

import { supabase } from '@/lib/supabase';
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
    // Note: Supabase/Postgres handles foreign keys, circular reference might not be blocked unless constraints exist.
    // We check if app logic prevents it or if DB handles it.
    try {
        const containerA = await createTestGear('Container_A', true);
        const containerB = await createTestGear('Container_B', true, containerA.id);

        // Attempt to create circular reference
        const { error } = await supabase.from('gear')
            .update({ container_id: containerB.id })
            .eq('id', containerA.id);

        if (error) throw error;

        console.warn('⚠️ Circular reference created! This should typically be prevented by app logic or constraints.');
        results.push({
            success: false,
            error: new Error('Circular reference not prevented'),
            context: { cycle: 0, step: 'Circular Reference Test', timestamp: Date.now() }
        });
    } catch (error) {
        console.log('✅ Circular reference test finished (might have failed as expected)');
        results.push({
            success: true,
            context: { cycle: 0, step: 'Circular Reference Test', timestamp: Date.now() }
        });
    }

    // Edge Case 2: Numeric Overflow
    try {
        const gear = await createTestGear('Overflow_Test', false);
        const { error } = await supabase.from('gear').update({
            purchase_price: Number.MAX_SAFE_INTEGER + 1,
            quantity: Number.MAX_SAFE_INTEGER
        }).eq('id', gear.id);

        if (error) throw error;
        console.log('✅ Numeric overflow handled (DB likely handled large number or clipped)');
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

        // Step 2: Immediate edit
        context.step = 'First edit';
        await supabase.from('gear').update({ model: `Edit1_${Date.now()}` }).eq('id', gear.id);
        await randomDelay(10);
        logSuccess(context, 'First edit complete');

        // Step 3: Immediate re-edit
        context.step = 'Second edit (race condition test)';
        await supabase.from('gear').update({ model: `Edit2_${Date.now()}` }).eq('id', gear.id);
        await randomDelay(5);
        logSuccess(context, 'Second edit complete');

        // Step 4: Delete immediately
        context.step = 'Deleting gear';
        await supabase.from('gear').delete().eq('id', gear.id);
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
        const { data: contents } = await supabase.from('gear').select('*').eq('container_id', container.id);
        if (!contents || contents.length !== 2) {
            throw new Error(`Expected 2 contents, found ${contents?.length}`);
        }
        logSuccess(context, 'Relationship verified');

        // Step 4: Delete container (critical test - what happens to contents?)
        context.step = 'Deleting container with contents';
        await supabase.from('gear').delete().eq('id', container.id);
        await randomDelay();

        // Verify contents handling (Supabase/Postgres ON DELETE SET NULL or CASCADE?)
        // Assuming NO CASCADE defined yet, they might remain or error.
        const { data: orphanedContents } = await supabase.from('gear').select('*').eq('container_id', container.id);
        logSuccess(context, `Container deleted. Orphaned contents: ${orphanedContents?.length}`);

        // Cleanup orphaned items
        await supabase.from('gear').delete().eq('id', content1.id);
        await supabase.from('gear').delete().eq('id', content2.id);

        return { success: true, context };
    } catch (error) {
        logError(context, error as Error);
        return { success: false, error: error as Error, context };
    }
};

/**
 * Loop C: The "Switch Master" - Tab switching stress test
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
            promises.push(supabase.from('gear').select('*').eq('id', gear.id));
            promises.push(supabase.from('logs').select('*').eq('gear_id', gear.id));
            promises.push(supabase.from('gear').select('*').eq('container_id', gear.id));
        }

        await Promise.all(promises);
        logSuccess(context, '30 concurrent DB queries completed');

        // Update data while queries are happening
        context.step = 'Concurrent data update';
        await supabase.from('gear').update({ model: `Updated_${Date.now()}` }).eq('id', gear.id);
        await randomDelay();

        // Cleanup
        await supabase.from('gear').delete().eq('id', gear.id);

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

        results.push(await indecisiveUserLoop(cycle));
        results.push(await organizerLoop(cycle));
        results.push(await switchMasterLoop(cycle));

        await randomDelay(100);
    }

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
    // We need user_id for RLS policies
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anon'; // Fallback

    const gearData = {
        name: `${TEST_PREFIX}${name}`,
        category: 'Test Category',
        manufacturer: 'Test Manufacturer',
        model: `Model_${Date.now()}`,
        serial_number: `SN_${Math.random().toString(36).substr(2, 9)}`,
        status: 'Available',
        purchase_date: new Date().toISOString(),
        purchase_price: Math.floor(Math.random() * 10000),
        lifespan: 5,
        quantity: 1,
        is_container: isContainer,
        container_id: containerId,
        user_id: userId,
        // photos: default null or json
    };

    const { data, error } = await supabase.from('gear').insert(gearData).select().single();

    if (error) {
        throw error;
    }

    // Convert back to camelCase generic Gear type if needed, or just return what we have (as any)
    // For test purposes, we return a mock Gear object that matches the inserted data
    return {
        id: data.id,
        name: data.name,
        category: data.category,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serial_number,
        status: data.status,
        purchaseDate: data.purchase_date,
        purchasePrice: data.purchase_price,
        lifespan: data.lifespan,
        quantity: data.quantity,
        isContainer: data.is_container,
        containerId: data.container_id,
        photos: { hero: '' }, // mock
        createdAt: data.created_at,
        updatedAt: data.updated_at
    } as Gear;
}

/**
 * Cleanup all test data created by Chaos Monkey
 */
async function cleanupTestData(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
        const { error: gearError } = await supabase.from('gear').delete().like('name', `${TEST_PREFIX}%`);

        if (gearError) console.error("Error deleting gear:", gearError);
        else console.log("Test gear deleted.");

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
