import type { Gear } from "@/types";

/**
 * Generate detailed AI analysis prompt for audio/video equipment
 * This prompt is designed for professional LLMs (ChatGPT, Perplexity, Gemini)
 * to provide comprehensive technical analysis and serial number decoding
 */
export function generateGearAnalysisPrompt(gear: Gear): string {
    const serialInfo = gear.serialNumber
        ? `\n- シリアルNo: ${gear.serialNumber}`
        : `\n- シリアルNo: (不明)`;

    const prompt = `あなたはプロの音響機材エンジニア・査定員です。
以下の機材について、詳細なスペックと歴史的背景、およびシリアルナンバーからの製造年推定を行ってください。

【対象機材】
- メーカー: ${gear.manufacturer}
- モデル名: ${gear.model}
- カテゴリ: ${gear.category}${serialInfo}

【回答してほしい項目】
1. **モデルの概要と歴史**: 発売開始年、生産終了年、名機と呼ばれる理由や特徴。
2. **技術スペック**: 周波数特性、インピーダンス、推奨用途など。
3. **シリアル解析**: ${gear.serialNumber ? '提示したシリアルナンバーから製造年月が推定できる場合はその時期。（例: ShureやBOSS、Fenderなどの規則性に照らし合わせて）' : 'シリアルナンバーが不明なため、この項目はスキップしてください。'}
4. **中古市場での評価**: ビンテージとしての価値がある時期のモデルか、現行品か。

情報は簡潔に、箇条書きでまとめてください。`;

    return prompt;
}

/**
 * AI tool options for research
 */
export const AI_TOOLS = {
    chatgpt: {
        name: 'ChatGPT',
        url: 'https://chat.openai.com/',
        icon: '🤖'
    },
    perplexity: {
        name: 'Perplexity',
        url: 'https://www.perplexity.ai/',
        icon: '🔍'
    },
    gemini: {
        name: 'Gemini',
        url: 'https://gemini.google.com/',
        icon: '✨'
    }
} as const;

export type AIToolKey = keyof typeof AI_TOOLS;
