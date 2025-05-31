'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@repo/ui/src/components/button';

interface ModeToggleProps {
	onClose?: () => void;
}

export function ModeToggle({ onClose }: ModeToggleProps) {
	const { theme, setTheme } = useTheme();

	const handleToggle = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	return (
		<Button variant="outlined" size="icon" onClick={handleToggle}>
			<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
