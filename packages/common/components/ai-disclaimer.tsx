import { TypographySmall } from "@repo/ui";

export const AIDisclaimer = ({ className }: { className?: string }) => {
    return (
        <div className={`text-center ${className || ""}`}>
            <TypographySmall className="text-muted-foreground text-xs">
                VT is an independent platform providing custom interfaces for AI models.
                <br />
                Not affiliated with, endorsed by, or sponsored by OpenAI, Anthropic, Google, or
                other AI model providers.
            </TypographySmall>
        </div>
    );
};

export const WrapperDisclosure = ({ className }: { className?: string }) => {
    return (
        <div className={`text-center ${className || ""}`}>
            <TypographySmall className="text-muted-foreground text-xs">
                Our platform offers a user-friendly interface built on top of AI models to enhance
                usability and provide additional features.
                <br />
                We are an independent service and not affiliated with the model providers.
            </TypographySmall>
        </div>
    );
};
