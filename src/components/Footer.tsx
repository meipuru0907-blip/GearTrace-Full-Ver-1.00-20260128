import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Footer() {
    const { language, setLanguage } = useLanguage();

    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built for GearTrace.
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">Language:</span>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                            onClick={() => setLanguage('ja')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium transition-colors hover:bg-muted",
                                language === 'ja' ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-transparent text-muted-foreground"
                            )}
                        >
                            日本語
                        </button>
                        <div className="w-[1px] h-4 bg-border"></div>
                        <button
                            onClick={() => setLanguage('en')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium transition-colors hover:bg-muted",
                                language === 'en' ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-transparent text-muted-foreground"
                            )}
                        >
                            English
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
