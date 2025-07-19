"use client";

import { FeatureSlug } from "@repo/shared/types/subscription";
import { Calculator } from "lucide-react";
import { FeatureToggleButton } from "./FeatureToggleButton";

export function MathCalculatorButton() {
    return (
        <FeatureToggleButton
            enabledSelector={(state) => state.useMathCalculator}
            activeKey="mathCalculator"
            icon={<Calculator />}
            label="Calculator"
            colour="orange"
            requiredFeature={FeatureSlug.MATH_CALCULATOR}
            tooltip={(enabled) => (enabled ? "Math Calculator - Enabled" : "Math Calculator")}
            featureName="math calculator"
            logPrefix="🧮"
            loginDescription="Please log in to use math calculator functionality."
        />
    );
}
