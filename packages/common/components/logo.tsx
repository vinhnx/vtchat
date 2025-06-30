import * as React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    round?: boolean;
}

export const Logo = ({ round = false, ...props }: LogoProps) => (
    <svg
        width="800px"
        height="800px"
        viewBox="-7.5 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>{'v'}</title>
        {round ? (
            <circle cx={8.5} cy={16} r={16} fill="#BFB38F" />
        ) : (
            <rect x={-7.5} y={0} width={32} height={32} fill="#BFB38F" />
        )}
        <path
            d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z"
            fill="none"
            stroke="#262626"
            strokeWidth={1}
        />
    </svg>
);

export const DarkLogo = ({ round = false, ...props }: LogoProps) => (
    <svg
        width="800px"
        height="800px"
        viewBox="-7.5 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>{'v'}</title>
        {round ? (
            <circle cx={8.5} cy={16} r={16} fill="#BFB38F" />
        ) : (
            <rect x={-7.5} y={0} width={32} height={32} fill="#BFB38F" />
        )}
        <path
            d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z"
            fill="none"
            stroke="#262626"
            strokeWidth={1}
        />
    </svg>
);
