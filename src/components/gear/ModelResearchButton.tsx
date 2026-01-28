import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Gear } from "@/types";
import { generateGearAnalysisPrompt, AI_TOOLS, type AIToolKey } from "@/utils/aiPromptBuilder";

interface ModelResearchButtonProps {
    gear: Gear;
}

export function ModelResearchButton({ gear }: ModelResearchButtonProps) {
    const [copied, setCopied] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleCopyAndOpen = async (toolKey: AIToolKey) => {
        try {
            // Generate detailed prompt
            const prompt = generateGearAnalysisPrompt(gear);

            // Copy to clipboard
            await navigator.clipboard.writeText(prompt);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Show success message
            toast.success(`プロンプトをコピーしました！\n${AI_TOOLS[toolKey].name}を開きます...`, {
                duration: 3000
            });

            // Open AI tool
            const url = AI_TOOLS[toolKey].url;
            window.open(url, '_blank');

            setShowDropdown(false);
        } catch (error) {
            console.error("Copy failed:", error);
            toast.error("コピーに失敗しました。");
        }
    };

    return (
        <div className="relative">
            <div className="flex gap-1">
                {/* Main button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAndOpen('gemini')}
                    className="gap-2 text-xs h-9 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950 flex-1"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">コピー完了！</span>
                            <span className="sm:hidden">完了</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">AI解析アシスタント</span>
                            <span className="sm:hidden">AI解析</span>
                        </>
                    )}
                </Button>

                {/* Dropdown trigger */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="h-9 px-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
                <div
                    className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-lg shadow-lg z-50 py-2"
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                        AIツールを選択
                    </div>
                    {Object.entries(AI_TOOLS).map(([key, tool]) => (
                        <button
                            key={key}
                            onClick={() => handleCopyAndOpen(key as AIToolKey)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                        >
                            <span className="text-lg">{tool.icon}</span>
                            <div className="flex-1">
                                <div className="font-medium">{tool.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    プロンプトをコピーして開く
                                </div>
                            </div>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
