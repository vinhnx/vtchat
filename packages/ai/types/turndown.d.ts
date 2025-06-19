declare module 'turndown' {
  interface Options {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: string;
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: string;
    emDelimiter?: string;
    strongDelimiter?: string;
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  class TurndownService {
    constructor(options?: Options);
    turndown(html: string): string;
    use(plugin: any): TurndownService;
    addRule(key: string, rule: any): TurndownService;
    keep(filter: string | string[] | Function): TurndownService;
    remove(filter: string | string[] | Function): TurndownService;
  }

  export = TurndownService;
}
