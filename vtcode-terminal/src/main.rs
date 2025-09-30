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

const HEADER_HEIGHT: u16 = 6;
const FOOTER_HEIGHT: u16 = 3;
const INNER_MARGIN: u16 = 1;
const LEFT_COLUMN_PERCENT: u16 = 60;
const RIGHT_COLUMN_PERCENT: u16 = 40;
const POLL_INTERVAL_MS: u64 = 250;

#[derive(Clone, Copy)]
enum CopyKey {
    Logo,
    Tagline,
    Summary,
    HighlightsHeading,
    ActionsHeading,
    FooterLaunch,
    FooterQuit,
    Spacer,
    Divider,
    Dash,
    FeatureLocalTitle,
    FeatureLocalDetail,
    FeatureReusableTitle,
    FeatureReusableDetail,
    FeatureInstantTitle,
    FeatureInstantDetail,
    ActionDocsTitle,
    ActionDocsDetail,
    ActionSessionTitle,
    ActionSessionDetail,
    ActionConfigureTitle,
    ActionConfigureDetail,
}

impl CopyKey {
    fn text(self) -> &'static str {
        match self {
            Self::Logo => "> VT Code",
            Self::Tagline => "Minimal terminal workspace for focused AI creation",
            Self::Summary => {
                "Concise toolkit with essentials upfront so you can ship without friction."
            }
            Self::HighlightsHeading => "Focus Points",
            Self::ActionsHeading => "Quick Actions",
            Self::FooterLaunch => "enter to open",
            Self::FooterQuit => "q / esc to close",
            Self::Spacer => " ",
            Self::Divider => "•",
            Self::Dash => "—",
            Self::FeatureLocalTitle => "Local-first privacy",
            Self::FeatureLocalDetail => "Offline-first, nothing leaves your machine.",
            Self::FeatureReusableTitle => "Reusable workflows",
            Self::FeatureReusableDetail => "Pin curated flows and prompts for reuse.",
            Self::FeatureInstantTitle => "Instant project boot",
            Self::FeatureInstantDetail => "Boot with sensible defaults already staged.",
            Self::ActionDocsTitle => "Open docs",
            Self::ActionDocsDetail => "Read keyboard map and integrations.",
            Self::ActionSessionTitle => "Start session",
            Self::ActionSessionDetail => "Resume workspace with pinned context.",
            Self::ActionConfigureTitle => "Configure models",
            Self::ActionConfigureDetail => "Choose AI providers before launching.",
        }
    }
}

#[derive(Clone, Copy)]
enum Feature {
    LocalFirst,
    ReusableFlows,
    InstantSetup,
}

impl Feature {
    fn title(self) -> &'static str {
        match self {
            Self::LocalFirst => CopyKey::FeatureLocalTitle.text(),
            Self::ReusableFlows => CopyKey::FeatureReusableTitle.text(),
            Self::InstantSetup => CopyKey::FeatureInstantTitle.text(),
        }
    }

    fn detail(self) -> &'static str {
        match self {
            Self::LocalFirst => CopyKey::FeatureLocalDetail.text(),
            Self::ReusableFlows => CopyKey::FeatureReusableDetail.text(),
            Self::InstantSetup => CopyKey::FeatureInstantDetail.text(),
        }
    }
}

const FEATURES: [Feature; 3] = [
    Feature::LocalFirst,
    Feature::ReusableFlows,
    Feature::InstantSetup,
];

#[derive(Clone, Copy)]
enum QuickAction {
    OpenDocs,
    StartSession,
    ConfigureModels,
}

impl QuickAction {
    fn label(self) -> &'static str {
        match self {
            Self::OpenDocs => CopyKey::ActionDocsTitle.text(),
            Self::StartSession => CopyKey::ActionSessionTitle.text(),
            Self::ConfigureModels => CopyKey::ActionConfigureTitle.text(),
        }
    }

    fn description(self) -> &'static str {
        match self {
            Self::OpenDocs => CopyKey::ActionDocsDetail.text(),
            Self::StartSession => CopyKey::ActionSessionDetail.text(),
            Self::ConfigureModels => CopyKey::ActionConfigureDetail.text(),
        }
    }
}

const ACTIONS: [QuickAction; 3] = [
    QuickAction::OpenDocs,
    QuickAction::StartSession,
    QuickAction::ConfigureModels,
];

struct App {
    features: &'static [Feature],
    actions: &'static [QuickAction],
}

impl App {
    fn new() -> Self {
        Self {
            features: &FEATURES,
            actions: &ACTIONS,
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

    render_header(frame, sections[0]);
    render_body(frame, sections[1], app);
    render_footer(frame, sections[2]);
}

fn render_header(frame: &mut Frame, area: Rect) {
    let header_lines = vec![
        Line::from(Span::styled(
            CopyKey::Logo.text(),
            Style::default().add_modifier(Modifier::BOLD),
        )),
        Line::from(Span::styled(
            CopyKey::Tagline.text(),
            Style::default().fg(Color::Gray),
        )),
        Line::from(Span::styled(
            CopyKey::Summary.text(),
            Style::default().fg(Color::Gray),
        )),
    ];

    let header = Paragraph::new(header_lines)
        .wrap(Wrap { trim: true })
        .alignment(Alignment::Left);

    frame.render_widget(header, area);
}

fn render_body(frame: &mut Frame, area: Rect, app: &App) {
    let columns = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage(LEFT_COLUMN_PERCENT),
            Constraint::Percentage(RIGHT_COLUMN_PERCENT),
        ])
        .split(area);

    render_features(frame, columns[0], app.features);
    render_actions(frame, columns[1], app.actions);
}

fn render_features(frame: &mut Frame, area: Rect, features: &[Feature]) {
    let bullet_style = Style::default().add_modifier(Modifier::BOLD);
    let description_style = Style::default().fg(Color::Gray);

    let items: Vec<ListItem> = features
        .iter()
        .map(|feature| {
            let content = Line::from(vec![
                Span::styled(CopyKey::Divider.text(), bullet_style),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(
                    feature.title(),
                    Style::default().add_modifier(Modifier::BOLD),
                ),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(CopyKey::Dash.text(), description_style),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(feature.detail(), description_style),
            ]);

            ListItem::new(content)
        })
        .collect();

    let list = List::new(items).block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::DarkGray))
            .title(Span::styled(
                CopyKey::HighlightsHeading.text(),
                Style::default().add_modifier(Modifier::BOLD),
            )),
    );

    frame.render_widget(list, area);
}

fn render_actions(frame: &mut Frame, area: Rect, actions: &[QuickAction]) {
    let bullet_style = Style::default().add_modifier(Modifier::BOLD);
    let description_style = Style::default().fg(Color::Gray);

    let items: Vec<ListItem> = actions
        .iter()
        .map(|action| {
            let content = Line::from(vec![
                Span::styled(CopyKey::Divider.text(), bullet_style),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(
                    action.label(),
                    Style::default().add_modifier(Modifier::BOLD),
                ),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(CopyKey::Dash.text(), description_style),
                Span::raw(CopyKey::Spacer.text()),
                Span::styled(action.description(), description_style),
            ]);

            ListItem::new(content)
        })
        .collect();

    let list = List::new(items).block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::DarkGray))
            .title(Span::styled(
                CopyKey::ActionsHeading.text(),
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
