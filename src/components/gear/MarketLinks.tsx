import { Button } from "@/components/ui/button";
import { ExternalLink, Search, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Gear } from "@/types";

interface MarketLinksProps {
    gear: Gear;
}

export function MarketLinks({ gear }: MarketLinksProps) {
    const query = encodeURIComponent(`${gear.manufacturer} ${gear.model}`);

    const markets = [
        { name: "デジマート", url: `https://www.digimart.net/search?categoryNames=&keyword=${query}`, color: "hover:text-orange-500" },
        { name: "メルカリ", url: `https://jp.mercari.com/search?keyword=${query}`, color: "hover:text-red-500" },
        { name: "Reverb", url: `https://reverb.com/marketplace?query=${query}`, color: "hover:text-orange-600" },
        { name: "ヤフオク!", url: `https://auctions.yahoo.co.jp/search/search?p=${query}`, color: "hover:text-yellow-500" },
    ];

    return (
        <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    販売相場をチェック
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-2">
                    {markets.map((market) => (
                        <Button
                            key={market.name}
                            variant="outline"
                            size="sm"
                            className={`h-8 gap-1 justify-start px-2 w-full ${market.color}`}
                            onClick={() => window.open(market.url, '_blank')}
                        >
                            <Search className="h-3 w-3" />
                            <span className="truncate flex-1 text-left">{market.name}</span>
                            <ExternalLink className="h-3 w-3 ml-0.5 opacity-50 flex-shrink-0" />
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
