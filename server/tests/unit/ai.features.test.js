/**
 * ai.features.test.js
 * Unit tests for AI-driven features:
 *   - AI description generation
 *   - AI price estimation
 */

import { jest } from '@jest/globals';

// ─── Mock AI Provider (e.g. OpenAI/Gemini) ──────────────────────────────────

const mockAICompletion = jest.fn();

// ─── Simulated AI Service ─────────────────────────────────────────────────────

async function generateDescription({ productName, category, condition, details }) {
    if (!productName) throw new Error('Product name is required');
    if (!category) throw new Error('Category is required');

    const prompt = `Write a compelling auction listing description for a ${condition} ${productName} in the ${category} category. Details: ${details || 'N/A'}`;

    const response = await mockAICompletion({
        model: 'gemini-2.0-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
    });

    if (!response || !response.text) throw new Error('AI service returned empty response');

    return {
        description: response.text,
        model: response.model,
        tokensUsed: response.usage?.total_tokens,
    };
}

async function estimatePrice({ productName, category, condition, marketData }) {
    if (!productName) throw new Error('Product name is required for price estimation');
    if (!category) throw new Error('Category is required for price estimation');

    const validConditions = ['mint', 'excellent', 'good', 'fair', 'poor'];
    if (!validConditions.includes(condition)) throw new Error(`Invalid condition: ${condition}`);

    const response = await mockAICompletion({
        model: 'gemini-2.0-flash',
        messages: [
            {
                role: 'user',
                content: `Estimate the market value for: ${condition} ${productName} (${category}). Market data: ${JSON.stringify(marketData)}. Return a JSON with minPrice, maxPrice, and estimatedPrice.`,
            },
        ],
        max_tokens: 100,
    });

    if (!response || !response.priceRange) throw new Error('Could not estimate price');

    return response.priceRange;
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('AI Features — Description Generation', () => {
    const validInput = {
        productName: 'Rolex Submariner 16610',
        category: 'Watches',
        condition: 'excellent',
        details: 'Full box and papers, purchased 1998, serviced 2022',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('generates description successfully with valid input', async () => {
        mockAICompletion.mockResolvedValue({
            text: 'An extraordinary Rolex Submariner 16610 in excellent condition...',
            model: 'gemini-2.0-flash',
            usage: { total_tokens: 250 },
        });

        const result = await generateDescription(validInput);

        expect(result.description).toBeDefined();
        expect(typeof result.description).toBe('string');
        expect(result.description.length).toBeGreaterThan(0);
        expect(mockAICompletion).toHaveBeenCalledTimes(1);
    });

    test('passes correct prompt with product details to AI model', async () => {
        mockAICompletion.mockResolvedValue({
            text: 'Description...',
            model: 'gemini-2.0-flash',
            usage: { total_tokens: 100 },
        });

        await generateDescription(validInput);

        const callArgs = mockAICompletion.mock.calls[0][0];
        expect(callArgs.messages[0].content).toContain('Rolex Submariner 16610');
        expect(callArgs.messages[0].content).toContain('Watches');
    });

    test('fails when product name is missing', async () => {
        const { productName, ...withoutName } = validInput;
        await expect(generateDescription(withoutName)).rejects.toThrow('Product name is required');
    });

    test('fails when category is missing', async () => {
        const { category, ...withoutCategory } = validInput;
        await expect(generateDescription(withoutCategory)).rejects.toThrow('Category is required');
    });

    test('throws error when AI service returns empty response', async () => {
        mockAICompletion.mockResolvedValue(null);

        await expect(generateDescription(validInput)).rejects.toThrow('AI service returned empty response');
    });

    test('works without optional details field', async () => {
        mockAICompletion.mockResolvedValue({
            text: 'A high-quality watch...',
            model: 'gemini-2.0-flash',
            usage: { total_tokens: 80 },
        });

        const { details, ...withoutDetails } = validInput;
        const result = await generateDescription(withoutDetails);

        expect(result.description).toBeDefined();
    });
});

describe('AI Features — Price Estimation', () => {
    const validInput = {
        productName: 'Sony Walkman TPS-L2',
        category: 'Electronics',
        condition: 'excellent',
        marketData: [
            { soldAt: 1200, date: '2024-12-01' },
            { soldAt: 1350, date: '2025-01-15' },
            { soldAt: 1100, date: '2025-02-20' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns price estimate with min, max, and estimated values', async () => {
        mockAICompletion.mockResolvedValue({
            priceRange: { minPrice: 1050, maxPrice: 1400, estimatedPrice: 1225 },
        });

        const result = await estimatePrice(validInput);

        expect(result).toHaveProperty('minPrice');
        expect(result).toHaveProperty('maxPrice');
        expect(result).toHaveProperty('estimatedPrice');
        expect(result.estimatedPrice).toBeGreaterThanOrEqual(result.minPrice);
        expect(result.estimatedPrice).toBeLessThanOrEqual(result.maxPrice);
    });

    test('fails with invalid condition value', async () => {
        await expect(
            estimatePrice({ ...validInput, condition: 'broken' })
        ).rejects.toThrow('Invalid condition: broken');
    });

    test('fails when product name is missing', async () => {
        const { productName, ...withoutName } = validInput;
        await expect(estimatePrice(withoutName)).rejects.toThrow('Product name is required');
    });

    test('throws error when AI cannot provide price estimate', async () => {
        mockAICompletion.mockResolvedValue(null);

        await expect(estimatePrice(validInput)).rejects.toThrow('Could not estimate price');
    });
});
