
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "lucide-react";

import { openBugReportForm } from "@/utils/systemInfo";

export function BugReportSection() {
    const handleReport = () => {
        openBugReportForm();
    };

    return (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <CardTitle className="text-lg">バグ報告・機能要望</CardTitle>
                </div>
                <CardDescription>
                    アプリの不具合や、「こんな機能が欲しい」というご意見をお聞かせください。
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        開発者が確認し、今後の改善に役立てさせていただきます。<br />
                        <span className="text-xs opacity-80">※ Googleフォームが開きます</span>
                    </p>
                    <Button
                        onClick={handleReport}
                        className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-700 dark:hover:bg-orange-600 shrink-0"
                    >
                        フォームを開く
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
