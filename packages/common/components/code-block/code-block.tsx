'use client';

import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-stylus';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-clojure';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-handlebars';
import 'prismjs/components/prism-django';
import 'prismjs/components/prism-twig';
import 'prismjs/components/prism-vim';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-properties';
import 'prismjs/components/prism-log';
import 'prismjs/components/prism-regex';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-elixir';
import 'prismjs/components/prism-erlang';
import 'prismjs/components/prism-elm';
import 'prismjs/components/prism-fsharp';
import 'prismjs/components/prism-ocaml';
import 'prismjs/components/prism-reason';
import 'prismjs/components/prism-purescript';
import 'prismjs/components/prism-zig';

import { Button, cn } from '@repo/ui';
import { Check, Copy, File, FileCode, FileJson, FileText, Terminal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './code-block.css';
import { log } from '@repo/shared/logger';

export type CodeBlockProps = {
    lang?: string;
    code?: string;
    showHeader?: boolean;
    variant?: 'default' | 'secondary';
    maxHeight?: number;
    className?: string;
};

export const CodeBlock = ({
    lang = 'plaintext',
    code,
    showHeader = true,
    variant = 'default',
    maxHeight: _maxHeight = 400,
    className,
}: CodeBlockProps) => {
    const ref = useRef<HTMLElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const { copy, showCopied } = useClipboard();

    useEffect(() => {
        if (ref?.current && code) {
            try {
                // Clear any existing highlighting
                ref.current.innerHTML = code;

                // Normalize language name for better compatibility
                const normalizedLang = lang.toLowerCase();

                // Check if language is supported
                if (Prism.languages[normalizedLang]) {
                    Prism.highlightElement(ref.current);
                } else {
                    // Try common language aliases
                    const langAliases: Record<string, string> = {
                        js: 'javascript',
                        ts: 'typescript',
                        py: 'python',
                        rb: 'ruby',
                        sh: 'bash',
                        shell: 'bash',
                        zsh: 'bash',
                        fish: 'bash',
                        ksh: 'bash',
                        csh: 'bash',
                        tcsh: 'bash',
                        yml: 'yaml',
                        dockerfile: 'docker',
                        md: 'markdown',
                        cs: 'csharp',
                        cpp: 'cpp',
                        'c++': 'cpp',
                        fs: 'fsharp',
                        kt: 'kotlin',
                        rs: 'rust',
                        gql: 'graphql',
                        ps1: 'powershell',
                        text: 'plaintext',
                        txt: 'plaintext',
                    };

                    const aliasedLang = langAliases[normalizedLang];
                    if (aliasedLang && Prism.languages[aliasedLang]) {
                        // Update the ref className to use the aliased language
                        ref.current.className = `language-${aliasedLang}`;
                        Prism.highlightElement(ref.current);
                    } else {
                        // Fallback to plaintext if language not supported
                        ref.current.className = 'language-plaintext';
                        Prism.highlightElement(ref.current);
                    }
                }
            } catch (error) {
                log.error({ error, lang, codeLength: code?.length }, 'Error highlighting code');
                // Fallback to plain text if highlighting fails
                if (ref.current) {
                    ref.current.innerHTML = code;
                }
            }
        }
    }, [code, lang]);

    const getLangIcon = () => {
        switch (lang) {
            case 'bash':
            case 'sh':
            case 'shell':
            case 'zsh':
            case 'fish':
            case 'ksh':
            case 'csh':
            case 'tcsh':
            case 'powershell':
                return <Terminal size={14} />;
            case 'json':
            case 'yaml':
            case 'yml':
            case 'toml':
            case 'xml':
            case 'ini':
            case 'properties':
                return <FileJson size={14} />;
            case 'python':
            case 'javascript':
            case 'js':
            case 'typescript':
            case 'ts':
            case 'jsx':
            case 'tsx':
            case 'java':
            case 'c':
            case 'cpp':
            case 'csharp':
            case 'cs':
            case 'php':
            case 'ruby':
            case 'go':
            case 'rust':
            case 'kotlin':
            case 'swift':
            case 'r':
            case 'scala':
            case 'clojure':
            case 'haskell':
            case 'lua':
            case 'perl':
            case 'dart':
            case 'elixir':
            case 'erlang':
            case 'elm':
            case 'fsharp':
            case 'ocaml':
            case 'reason':
            case 'purescript':
            case 'zig':
            case 'solidity':
                return <FileCode size={14} />;
            case 'css':
            case 'scss':
            case 'sass':
            case 'less':
            case 'stylus':
                return <FileCode size={14} />;
            case 'html':
            case 'handlebars':
            case 'django':
            case 'twig':
                return <FileCode size={14} />;
            case 'markdown':
            case 'md':
                return <FileText size={14} />;
            case 'sql':
            case 'graphql':
            case 'gql':
                return <FileCode size={14} />;
            case 'docker':
            case 'dockerfile':
            case 'nginx':
            case 'vim':
            case 'git':
            case 'diff':
            case 'makefile':
            case 'log':
            case 'regex':
                return <FileCode size={14} />;
            case 'plaintext':
            case 'text':
                return <File size={14} />;
            default:
                return <File size={14} />;
        }
    };

    return (
        <div
            className={cn(
                'not-prose bg-tertiary relative my-4 w-full overflow-hidden rounded-xl border px-1 pb-1',
                variant === 'secondary' && 'bg-secondary',
                className,
                !showHeader && 'rounded-none border-none bg-transparent p-0'
            )}
        >
            {showHeader && (
                <div className="text-foreground flex items-center justify-between py-1 pl-3 pr-1">
                    <p className="text-muted-foreground flex flex-row items-center gap-2 text-xs tracking-wide">
                        {getLangIcon()}
                        {lang}
                    </p>
                    <Button
                        className="gap-2"
                        onClick={() => code && copy(code)}
                        size="xs"
                        variant="ghost"
                    >
                        {showCopied ? (
                            <Check size={14} strokeWidth="2" />
                        ) : (
                            <Copy size={14} strokeWidth="2" />
                        )}
                    </Button>
                </div>
            )}
            <pre
                className={cn(
                    'no-scrollbar border-border bg-background text-foreground relative overflow-x-auto rounded-lg border px-6 py-4 font-mono text-[13px] font-[300]'
                )}
                ref={preRef}
            >
                <code className={cn(`language-${lang.toLowerCase()}`)} ref={ref}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useClipboard() {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const [showCopied, setShowCopied] = useState<boolean>(false);

    const copy: CopyFn = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            log.warn({}, 'Clipboard not supported');
            return false;
        }
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setShowCopied(true);
            setTimeout(() => {
                setShowCopied(false);
            }, 2000);
            return true;
        } catch (error) {
            log.warn({ data: error }, 'Copy failed');
            setCopiedText(null);
            return false;
        }
    }, []);

    return { copiedText, copy, showCopied };
}
