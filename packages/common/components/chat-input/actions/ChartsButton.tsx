'use client';

import { FeatureSlug } from '@repo/shared/types/subscription';
import { BarChart3 } from 'lucide-react';
import { FeatureToggleButton } from './FeatureToggleButton';

export function ChartsButton() {
    return (
        <FeatureToggleButton
            enabledSelector={(state) => state.useCharts}
            activeKey='charts'
            icon={<BarChart3 />}
            label='Charts'
            colour='purple'
            requiredFeature={FeatureSlug.CHART_VISUALIZATION}
            tooltip={(enabled) => (enabled ? 'Charts & Graphs - Enabled' : 'Charts & Graphs')}
            featureName='charts'
            logPrefix='📊'
            loginDescription='Please log in to use charts and graphs functionality.'
        />
    );
}
