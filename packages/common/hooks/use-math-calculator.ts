import { useAppStore } from '../store';

export const useMathCalculator = () => {
    const mathCalculatorEnabled = useAppStore((state) => state.useMathCalculator);
    const setMathCalculatorEnabled = useAppStore((state) => state.setUseMathCalculator);

    return {
        useMathCalculator: mathCalculatorEnabled,
        setUseMathCalculator: setMathCalculatorEnabled,
    };
};
