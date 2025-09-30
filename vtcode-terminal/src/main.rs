use std::{io, time::Duration};

use anyhow::Result;
use crossterm::{
    event::{self, Event, KeyCode},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    prelude::*,
    widgets::{Block, Borders, List, ListItem, Paragraph, Wrap},
};

const HEADER_HEIGHT: u16 = 11;
const FOOTER_HEIGHT: u16 = 3;
const INNER_MARGIN: u16 = 1;
const POLL_INTERVAL_MS: u64 = 250;

#[derive(Clone, Copy)]
enum CopyKey {
    Logo,
    MetaLine,
    FooterLaunch,
    FooterQuit,
    Spacer,
    Divider,
    Bullet,
    SectionProjectSummary,
    SectionKeyGuidelines,
    SectionUsageTips,
    SectionNextActions,
    ProjectVersion,
    WorkspaceTrust,
    ToolsPolicy,
    WorkspaceLanguages,
    HumanSafeguards,
    McpEnabled,
    GuidelineWorkspaceStructure,
    GuidelineCoreModules,
    TipDescribeGoal,
    TipReferenceGuidelines,
    TipTargetedReads,
    ActionReviewGuidelines,
    ActionRequestTour,
}

impl CopyKey {
    fn text(self) -> &'static str {
        match self {
            Self::Logo => "> VT Code",
            Self::MetaLine => "x-ai/grok-4-fast:free · medium",
            Self::FooterLaunch => "enter to open",
            Self::FooterQuit => "q / esc to close",
            Self::Spacer => " ",
            Self::Divider => "•",
            Self::Bullet => "*",
            Self::SectionProjectSummary => "Project context summary",
            Self::SectionKeyGuidelines => "Key guidelines",
            Self::SectionUsageTips => "Usage tips",
            Self::SectionNextActions => "Suggested Next Actions",
            Self::ProjectVersion => "Project: vtcode v0.15.9",
            Self::WorkspaceTrust => "Workspace trust: full auto",
            Self::ToolsPolicy => "Tools policy: Allow 6 · Prompt 12 · Deny 0 (.vtcode/tool-policy.json)",
            Self::WorkspaceLanguages => "Workspace languages: JavaScript:4, Python:2, Rust:176",
            Self::HumanSafeguards => "Human-in-the-loop safeguards: enabled",
            Self::McpEnabled => {
                "MCP (Model Context Protocol): enabled (time, context7, sequential-thinking)"
            }
            Self::GuidelineWorkspaceStructure => {
                "Workspace Structure: vtcode-core/ (library) + src/ (binary) with modular tools system"
            }
            Self::GuidelineCoreModules => {
                "Core Modules: llm/ (provider abstraction), tools/ (modular tool system), config/ (TOML-based settings)"
            }
            Self::TipDescribeGoal => {
                "Describe your current coding goal or ask for a quick status overview."
            }
            Self::TipReferenceGuidelines => {
                "Reference AGENTS.md guidelines when proposing changes."
            }
            Self::TipTargetedReads => {
                "Prefer asking for targeted file reads or diffs before editing."
            }
            Self::ActionReviewGuidelines => {
                "Review the highlighted guidelines and share the task you want to tackle."
            }
            Self::ActionRequestTour => "Ask for a workspace tour if you need more context.",
        }
    }
}

#[derive(Clone, Copy)]
enum SectionKey {
    ProjectSummary,
    KeyGuidelines,
    UsageTips,
    NextActions,
}

impl SectionKey {
    fn title(self) -> CopyKey {
        match self {
            Self::ProjectSummary => CopyKey::SectionProjectSummary,
            Self::KeyGuidelines => CopyKey::SectionKeyGuidelines,
            Self::UsageTips => CopyKey::SectionUsageTips,
            Self::NextActions => CopyKey::SectionNextActions,
        }
    }

    fn items(self) -> &'static [CopyKey] {
        match self {
            Self::ProjectSummary => &PROJECT_SUMMARY_ITEMS,
            Self::KeyGuidelines => &KEY_GUIDELINES_ITEMS,
            Self::UsageTips => &USAGE_TIPS_ITEMS,
            Self::NextActions => &NEXT_ACTIONS_ITEMS,
        }
    }
}

const PROJECT_SUMMARY_ITEMS: [CopyKey; 1] = [CopyKey::ProjectVersion];
const KEY_GUIDELINES_ITEMS: [CopyKey; 2] = [
    CopyKey::GuidelineWorkspaceStructure,
    CopyKey::GuidelineCoreModules,
];
const USAGE_TIPS_ITEMS: [CopyKey; 3] = [
    CopyKey::TipDescribeGoal,
    CopyKey::TipReferenceGuidelines,
    CopyKey::TipTargetedReads,
];
const NEXT_ACTIONS_ITEMS: [CopyKey; 2] =
    [CopyKey::ActionReviewGuidelines, CopyKey::ActionRequestTour];

const CORE_FACTS: [CopyKey; 5] = [
    CopyKey::WorkspaceTrust,
    CopyKey::ToolsPolicy,
    CopyKey::WorkspaceLanguages,
    CopyKey::HumanSafeguards,
    CopyKey::McpEnabled,
];

const SECTIONS: [SectionKey; 4] = [
    SectionKey::ProjectSummary,
    SectionKey::KeyGuidelines,
    SectionKey::UsageTips,
    SectionKey::NextActions,
];

struct App {
    core_facts: &'static [CopyKey],
    sections: &'static [SectionKey],
}

impl App {
    fn new() -> Self {
        Self {
            core_facts: &CORE_FACTS,
            sections: &SECTIONS,
        }
    }
}

type TerminalBackend = Terminal<CrosstermBackend<io::Stdout>>;

fn main() -> Result<()> {
    let mut terminal = setup_terminal()?;
    let app = App::new();
    let app_result = run_app(&mut terminal, &app);
    restore_terminal(&mut terminal)?;
    app_result
}

fn setup_terminal() -> Result<TerminalBackend> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    crossterm::execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    Ok(Terminal::new(backend)?)
}

fn restore_terminal(terminal: &mut TerminalBackend) -> Result<()> {
    disable_raw_mode()?;
    crossterm::execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

fn run_app(terminal: &mut TerminalBackend, app: &App) -> Result<()> {
    loop {
        terminal.draw(|frame| render(frame, app))?;

        if event::poll(Duration::from_millis(POLL_INTERVAL_MS))? {
            if let Event::Key(key) = event::read()? {
                match key.code {
                    KeyCode::Enter => break,
                    KeyCode::Esc | KeyCode::Char('q') => break,
                    _ => {}
                }
            }
        }
    }

    Ok(())
}

fn render(frame: &mut Frame, app: &App) {
    let area = frame.area();
    let title_style = Style::default().add_modifier(Modifier::BOLD);
    let frame_block = Block::default()
        .borders(Borders::ALL)
        .border_style(Style::default().fg(Color::DarkGray))
        .title(Span::styled(CopyKey::Logo.text(), title_style));
    let inner_area = frame_block.inner(area);
    frame.render_widget(frame_block, area);

    let sections = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(HEADER_HEIGHT),
            Constraint::Min(1),
            Constraint::Length(FOOTER_HEIGHT),
        ])
        .margin(INNER_MARGIN)
        .split(inner_area);

    render_header(frame, sections[0], app.core_facts);
    render_body(frame, sections[1], app);
    render_footer(frame, sections[2]);
}

fn render_header(frame: &mut Frame, area: Rect, facts: &[CopyKey]) {
    let mut header_lines = Vec::new();
    header_lines.push(Line::from(Span::styled(
        CopyKey::MetaLine.text(),
        Style::default().fg(Color::Gray),
    )));
    header_lines.push(Line::from(Span::raw(CopyKey::Spacer.text())));
    header_lines.push(Line::from(Span::styled(
        CopyKey::Logo.text(),
        Style::default().add_modifier(Modifier::BOLD),
    )));
    header_lines.push(Line::from(Span::raw(CopyKey::Spacer.text())));
    header_lines.extend(render_fact_lines(facts));

    let header = Paragraph::new(header_lines)
        .wrap(Wrap { trim: true })
        .alignment(Alignment::Left);

    frame.render_widget(header, area);
}

fn render_fact_lines(facts: &[CopyKey]) -> Vec<Line<'static>> {
    let fact_style = Style::default().fg(Color::Gray);
    facts
        .iter()
        .map(|fact| {
            Line::from(vec![
                Span::styled(
                    CopyKey::Bullet.text(),
                    Style::default().add_modifier(Modifier::BOLD),
                ),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(fact.text(), fact_style),
            ])
        })
        .collect()
}

fn render_body(frame: &mut Frame, area: Rect, app: &App) {
    let constraints = vec![Constraint::Min(4); app.sections.len()];
    let section_areas = Layout::default()
        .direction(Direction::Vertical)
        .constraints(constraints)
        .split(area);

    for (index, section) in app.sections.iter().enumerate() {
        render_section(frame, section_areas[index], *section);
    }
}

fn render_section(frame: &mut Frame, area: Rect, section: SectionKey) {
    let items: Vec<ListItem> = section
        .items()
        .iter()
        .map(|item| {
            let content = Line::from(vec![
                Span::styled(
                    CopyKey::Bullet.text(),
                    Style::default().add_modifier(Modifier::BOLD),
                ),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(item.text(), Style::default().fg(Color::Gray)),
            ]);

            ListItem::new(content)
        })
        .collect();

    let list = List::new(items).block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::DarkGray))
            .title(Span::styled(
                section.title().text(),
                Style::default().add_modifier(Modifier::BOLD),
            )),
    );

    frame.render_widget(list, area);
}

fn render_footer(frame: &mut Frame, area: Rect) {
    let hint_style = Style::default().add_modifier(Modifier::BOLD);
    let label_style = Style::default().fg(Color::Gray);

    let footer_line = Line::from(vec![
        Span::styled(CopyKey::FooterLaunch.text(), hint_style),
        Span::raw(CopyKey::Spacer.text()),
        Span::styled(CopyKey::Divider.text(), label_style),
        Span::raw(CopyKey::Spacer.text()),
        Span::styled(CopyKey::FooterQuit.text(), hint_style),
    ]);

    let footer = Paragraph::new(footer_line)
        .alignment(Alignment::Center)
        .wrap(Wrap { trim: true });

    frame.render_widget(footer, area);
}
