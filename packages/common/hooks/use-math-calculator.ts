import { useChatStore } from '../store';

export const useMathCalculator = () => {
    const mathCalculatorEnabled = useChatStore(state => state.useMathCalculator);
    const setMathCalculatorEnabled = useChatStore(state => state.setUseMathCalculator);

    return {
        useMathCalculator: mathCalculatorEnabled,
        setUseMathCalculator: setMathCalculatorEnabled,
    };
};
