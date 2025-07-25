import {
    Badge,
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@repo/ui";
import { TrendingDown, TrendingUp } from "lucide-react";

export function SectionCards() {
    return (
        <div className="@xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
            <Card className="@container/card from-primary/5 to-card shadow-xs bg-gradient-to-t">
                <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        $1,250.00
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <TrendingUp />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Visitors for the last 6 months</div>
                </CardFooter>
            </Card>
            <Card className="@container/card from-primary/5 to-card shadow-xs bg-gradient-to-t">
                <CardHeader>
                    <CardDescription>New Customers</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        1,234
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <TrendingDown />
                            -20%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Down 20% this period <TrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Acquisition needs attention</div>
                </CardFooter>
            </Card>
            <Card className="@container/card from-primary/5 to-card shadow-xs bg-gradient-to-t">
                <CardHeader>
                    <CardDescription>Active Accounts</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        45,678
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <TrendingUp />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Strong user retention <TrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Engagement exceed targets</div>
                </CardFooter>
            </Card>
            <Card className="@container/card from-primary/5 to-card shadow-xs bg-gradient-to-t">
                <CardHeader>
                    <CardDescription>Growth Rate</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        4.5%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <TrendingUp />
                            +4.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Steady performance increase <TrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Meets growth projections</div>
                </CardFooter>
            </Card>
        </div>
    );
}
