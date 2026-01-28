import { Button } from "@/components/ui/button";
import { X, HelpCircle } from "lucide-react";

interface DepreciationHelpModalProps {
    onClose: () => void;
}

export function DepreciationHelpModal({ onClose }: DepreciationHelpModalProps) {
    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            減価償却シミュレーターについて
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {/* What is Depreciation */}
                        <section>
                            <h3 className="text-lg font-semibold mb-3">📉 減価償却とは？</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                高額な機材を購入した場合、購入年に全額を経費にするのではなく、
                                <strong className="text-foreground">耐用年数（使用できる年数）に分けて少しずつ経費計上</strong>
                                していく会計ルールです。これにより、実際の使用期間に応じて適正な利益計算ができます。
                            </p>
                        </section>

                        {/* Benefits */}
                        <section>
                            <h3 className="text-lg font-semibold mb-3">💡 このシミュレーターのメリット</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <p><strong>税務申告が楽になる:</strong> 確定申告時に必要な減価償却費を自動計算</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <p><strong>現在価値が一目でわかる:</strong> 機材の帳簿価額（会計上の価値）をリアルタイム表示</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <p><strong>売却タイミングの判断材料:</strong> 帳簿価額と実際の市場価格を比較できる</p>
                                </div>
                            </div>
                        </section>

                        {/* Separator */}
                        <div className="border-b border-muted"></div>

                        {/* Term Explanation: Book Value */}
                        <section className="bg-muted/50 p-4 rounded-lg border border-muted">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                📖 用語解説：帳簿価額（Book Value）
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-foreground mb-1">
                                        ✦ <strong>「現在の会計上の価値」です</strong>
                                    </p>
                                    <p className="text-muted-foreground ml-4">
                                        買った値段から、毎年使った分（減価償却費）を差し引いた、残りの価値のことです。
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-foreground mb-1">
                                        ✦ <strong>最後は「1円」になります</strong>
                                    </p>
                                    <p className="text-muted-foreground ml-4">
                                        耐用年数（5年など）が過ぎても、機材を持っていることを忘れないために、
                                        価値を0円にせず「1円」だけ残します（備忘価額）。
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                                        ⚠️ <strong>注意：売れる値段（時価）ではありません</strong>
                                    </p>
                                    <p className="text-muted-foreground ml-4">
                                        帳簿価額が1円でも、人気機材なら10万円で売れることもあります。
                                        逆に帳簿価額が高くても、人気がなければ売れません。
                                        あくまで<strong className="text-foreground">「税金の計算に使う数字」</strong>です。
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Example */}
                        <section>
                            <h3 className="text-lg font-semibold mb-3">📊 計算例</h3>
                            <div className="bg-accent p-4 rounded-lg text-sm space-y-2">
                                <p className="font-mono">
                                    購入価格: ¥100,000（2023年1月購入）<br />
                                    耐用年数: 5年
                                </p>
                                <div className="border-t pt-2 space-y-1 text-muted-foreground">
                                    <p>• 年間償却額: ¥100,000 ÷ 5年 = ¥20,000/年</p>
                                    <p>• 2023年末: ¥100,000 - ¥20,000 = <strong className="text-foreground">¥80,000</strong></p>
                                    <p>• 2024年末: ¥80,000 - ¥20,000 = <strong className="text-foreground">¥60,000</strong></p>
                                    <p>• ... (中略)</p>
                                    <p>• 2028年以降: <strong className="text-primary">¥1（備忘価額）</strong></p>
                                </div>
                            </div>
                        </section>

                        {/* Footer Note */}
                        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border-l-4 border-primary">
                            <p className="font-semibold mb-1">💼 税理士への相談をおすすめします</p>
                            <p>
                                このシミュレーターは参考情報として提供しています。
                                実際の税務処理については、税理士や会計士にご相談ください。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
