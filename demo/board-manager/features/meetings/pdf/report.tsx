import { Document, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactElement, ReactNode } from 'react';
import { agendaNumbers, agendaOf, ROLES } from '../../../domain';
import type { AgendaEntry, Meeting, MeetingDocument } from '../../../domain';
import { db, getBoard, getMeeting, getPerson } from '../../../infra/in-memory';
import type { Db } from '../../../infra/in-memory';
import { translate } from '../../../shared/lib/i18n';
import { formatDateTime, formatSize, formatTime } from '../../../shared/shared';
import { parseMinutes } from '../components/minutes-format';

export { buildMeetingPdf };

// The report of a meeting as a PDF (react-pdf, A4): its data, the attendees (the board's members), the agenda with the
// minutes and the decision of every item, and the documents; "DRAFT" while the minutes are not approved, a footer
// with the page number on every page. Built from the fake server's current state. Loaded on first use (a dynamic
// import, see `pdf/index.tsx`).

// Black and white only (2026-10-01): text, accents and lines in black; set apart by weight, size and style instead.
const LINE = '#000';

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 9,
  },
  // The line height of running text (the minutes, a decision), on the texts themselves and together with the font size:
  // react-pdf (4.9) drops the fixed footer when the page has one, and applies a unitless one far too large on a text
  // without its own font size.
  text: { fontSize: 9, lineHeight: 1.4 },
  draft: { position: 'absolute', top: 20, right: 56, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  board: { fontSize: 9, marginBottom: 3 },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  facts: { borderTop: `0.5 solid ${LINE}`, borderBottom: `0.5 solid ${LINE}`, paddingVertical: 6, marginBottom: 14 },
  fact: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 80, fontFamily: 'Helvetica-Oblique' },
  heading: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 8, marginBottom: 5 },
  section: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 8, marginBottom: 3 },
  attendee: { flexDirection: 'row', marginBottom: 1 },
  attendeeName: { width: 180 },
  item: { marginBottom: 10 },
  itemTitle: { fontFamily: 'Helvetica-Bold' },
  itemMeta: { fontSize: 8, fontFamily: 'Helvetica-Oblique', marginBottom: 3 },
  body: { marginLeft: 12 },
  none: { fontFamily: 'Helvetica-Oblique' },
  decision: { marginTop: 3, paddingLeft: 6, borderLeft: `1.5 solid ${LINE}` },
  decisionLabel: { fontFamily: 'Helvetica-Bold' },
  block: { marginBottom: 3, fontSize: 9, lineHeight: 1.4 },
  listItem: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 16 },
  quote: {
    marginBottom: 3,
    paddingLeft: 6,
    borderLeft: `0.5 solid ${LINE}`,
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
    lineHeight: 1.4,
  },
  code: {
    marginBottom: 3,
    padding: 4,
    border: `0.5 solid ${LINE}`,
    fontFamily: 'Courier',
    fontSize: 9,
    lineHeight: 1.4,
  },
  document: { flexDirection: 'row', marginBottom: 1 },
  documentName: { flex: 1 },
  documentInfo: { width: 110, textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    borderTop: `0.5 solid ${LINE}`,
    paddingTop: 6,
  },
});

// The meeting's report as a PDF file.
async function buildMeetingPdf(meetingId: string): Promise<Blob> {
  const state = db.getState();
  const meeting = getMeeting(state, meetingId);

  if (meeting === undefined) {
    throw new Error('The meeting does not exist anymore.');
  }

  return pdf(<MeetingReport state={state} meeting={meeting} />).toBlob();
}

function MeetingReport({ state, meeting }: { state: Db; meeting: Meeting }): ReactElement {
  const board = getBoard(state, meeting.boardId)?.name ?? '';
  const agenda = agendaOf(state, meeting.id);
  const numbers = agendaNumbers(agenda);
  const items = agenda.flatMap((entry) => (entry.type === 'item' ? [entry.item] : []));
  const duration = items.reduce((sum, item) => sum + item.duration, 0);
  const end = new Date(new Date(meeting.start).getTime() + duration * 60_000);
  const attendees = state.memberships
    .filter((membership) => membership.boardId === meeting.boardId)
    .sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
    .flatMap((membership) => {
      const person = getPerson(state, membership.personId);

      return person === undefined ? [] : [{ name: person.name, role: membership.role }];
    });
  const documents = state.documents.filter((document) => document.meetingId === meeting.id);
  const draft = meeting.status === 'Held' && !meeting.minutesApproved;
  const minutes = meeting.status === 'Cancelled'
    ? translate('pdf.minutesCancelled')
    : meeting.status === 'Planned'
    ? translate('pdf.minutesPlanned')
    : meeting.minutesApproved
    ? translate('pdf.minutesApproved')
    : translate('pdf.minutesDraft');

  return (
    <Document
      title={`${meeting.title} – ${board}`}
      author={translate('shell.appName')}
      subject={translate('pdf.subject')}
    >
      <Page size="A4" style={styles.page}>
        {draft && <Text style={styles.draft} fixed>{translate('pdf.draft')}</Text>}
        <View>
          <Text style={styles.board}>{board}</Text>
          <Text style={styles.title}>{meeting.title}</Text>
          <View style={styles.facts}>
            <Fact label={translate('meetings.overview.dateTime')}>
              {`${formatDateTime(meeting.start)} – ${formatTime(end)} (${
                translate('meetings.durationMin', { count: duration })
              })`}
            </Fact>
            <Fact label={translate('meetings.overview.location')}>{meeting.location}</Fact>
            <Fact label={translate('meetings.overview.status')}>{translate(`statuses.${meeting.status}`)}</Fact>
            <Fact label={translate('meetings.columns.minutes')}>{minutes}</Fact>
          </View>

          <Text style={styles.heading}>{translate('pdf.attendees')}</Text>
          {attendees.map((attendee) => (
            <View key={`${attendee.name}-${attendee.role}`} style={styles.attendee}>
              <Text style={styles.attendeeName}>{attendee.name}</Text>
              <Text>{translate(`roles.${attendee.role}`)}</Text>
            </View>
          ))}

          <Text style={styles.heading}>{translate('pdf.agendaAndMinutes')}</Text>
          {agenda.map((entry, index) => (
            <AgendaEntryView
              key={entry.type === 'section' ? entry.section.id : entry.item.id}
              state={state}
              entry={entry}
              previous={agenda[index - 1]}
              numbers={numbers}
            />
          ))}

          {documents.length > 0 && (
            <View wrap={false}>
              <Text style={styles.heading}>{translate('meetings.tabs.documents')}</Text>
              {documents.map((document) => <DocumentLine key={document.id} document={document} />)}
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>{`${translate('shell.appName')} · ${meeting.title}`}</Text>
          <Text
            render={({ pageNumber, totalPages }) => translate('pdf.page', { page: pageNumber, total: totalPages })}
          />
        </View>
      </Page>
    </Document>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <View style={styles.fact}>
      <Text style={styles.label}>{label}</Text>
      <Text>{children}</Text>
    </View>
  );
}

// A section as a heading; an item with its presenter and duration, its minutes and its decision. "Other" (the items
// without a section, with sections only) gets its heading before its first item, like in the minutes tab.
function AgendaEntryView({ state, entry, previous, numbers }: {
  state: Db;
  entry: AgendaEntry;
  previous: AgendaEntry | undefined;
  numbers: Map<string, string>;
}): ReactElement {
  if (entry.type === 'section') {
    return (
      <Text style={styles.section} minPresenceAhead={40}>
        {numbered(numbers.get(entry.section.id) ?? '', entry.section.title)}
      </Text>
    );
  }

  const { item } = entry;
  const other = item.sectionId === '' && numbers.has('')
    && !(previous?.type === 'item' && previous.item.sectionId === '');
  const presenter = getPerson(state, item.presenterId)?.name ?? translate('pdf.noPresenter');
  const blocks = parseMinutes(item.minutes) as Block[] | undefined;
  const [first, ...rest] = blocks ?? [];

  return (
    <>
      {other && (
        <Text style={styles.section}>{numbered(numbers.get('') ?? '', translate('meetings.agenda.other'))}</Text>
      )}
      <View style={styles.item}>
        {
          /* The title, the presenter and the first block of the minutes are one group that never breaks (no title alone
            at the end of a page; `minPresenceAhead` had no effect here); the rest of the minutes may. */
        }
        <View wrap={false}>
          <Text style={styles.itemTitle}>{numbered(numbers.get(item.id) ?? '', item.title)}</Text>
          <Text style={styles.itemMeta}>
            {`${presenter} · ${translate('meetings.durationMin', { count: item.duration })}`}
          </Text>
          <View style={styles.body}>
            {first === undefined
              ? <Text style={styles.none}>{translate('pdf.noMinutes')}</Text>
              : <BlockList state={state} blocks={[first]} />}
          </View>
        </View>
        <View style={styles.body}>
          {/* A numbered list that starts in the first block counts on. */}
          <BlockList state={state} blocks={rest} start={first?.type === 'numberedListItem' ? 1 : 0} />
          {item.decision !== '' && (
            <View style={styles.decision}>
              <Text style={styles.text}>
                <Text style={styles.decisionLabel}>{translate('pdf.decision')}</Text>
                {` ${item.decision}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

function DocumentLine({ document }: { document: MeetingDocument }): ReactElement {
  return (
    <View style={styles.document}>
      <Text style={styles.documentName}>{document.name}</Text>
      <Text style={styles.documentInfo}>{`${document.type} · ${formatSize(document.size)}`}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The minutes: BlockNote's blocks as PDF text
// ---------------------------------------------------------------------------------------------------------------------

type Inline = {
  type?: string;
  text?: string;
  href?: string;
  styles?: Record<string, unknown>;
  props?: Record<string, unknown>;
  content?: unknown;
};

type Block = {
  type?: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: unknown[];
};

// Paragraphs, headings, lists (with their numbers), check lists, quotes and code; the other block types (tables,
// images, ...) as their text. Nested blocks are indented. `start`: the number of the numbered list item before them.
function BlockList(
  { state, blocks, start = 0 }: { state: Db; blocks: readonly Block[]; start?: number },
): ReactElement {
  let number = start;

  return (
    <>
      {blocks.map((block, index) => {
        number = block.type === 'numberedListItem' ? number + 1 : 0;

        return <BlockView key={index} state={state} block={block} number={number} />;
      })}
    </>
  );
}

function BlockView({ state, block, number }: { state: Db; block: Block; number: number }): ReactElement {
  const text = <InlineText state={state} content={block.content} />;
  const children = (block.children?.length ?? 0) > 0 && (
    <View style={{ marginLeft: 12 }}>
      <BlockList state={state} blocks={block.children as Block[]} />
    </View>
  );
  const marker = block.type === 'bulletListItem'
    ? '•'
    : block.type === 'numberedListItem'
    ? `${number}.`
    : block.type === 'checkListItem'
    // The standard fonts have no ballot boxes.
    ? (block.props?.['checked'] === true ? '[x]' : '[ ]')
    : undefined;

  if (marker !== undefined) {
    return (
      <>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>{marker}</Text>
          <Text style={[styles.text, { flex: 1 }]}>{text}</Text>
        </View>
        {children}
      </>
    );
  }

  const level = Number(block.props?.['level'] ?? 1);
  const style = block.type === 'heading'
    ? {
      fontFamily: 'Helvetica-Bold',
      fontSize: level === 1 ? 11 : level === 2 ? 10 : 9,
      marginTop: 4,
      marginBottom: 2,
    }
    : block.type === 'quote'
    ? styles.quote
    : block.type === 'codeBlock'
    ? styles.code
    : styles.block;

  return (
    <>
      <Text style={style}>{text}</Text>
      {children}
    </>
  );
}

// The inline content of a block: a string (old plain text), or text runs with their styles, links and mentions (the
// current name of the person).
function InlineText({ state, content }: { state: Db; content: unknown }): ReactNode {
  if (typeof content === 'string') {
    return content;
  }

  if (!Array.isArray(content)) {
    return null;
  }

  return (content as Inline[]).map((inline, index) => {
    if (typeof inline === 'string') {
      return inline;
    }

    if (inline.type === 'mention') {
      const name = getPerson(state, String(inline.props?.['personId'] ?? ''))?.name;

      return (
        <Text key={index} style={{ fontFamily: 'Helvetica-Bold' }}>
          {`@${name ?? translate('meetings.minutesView.deleted')}`}
        </Text>
      );
    }

    if (inline.type === 'link') {
      return (
        <Text key={index} style={{ textDecoration: 'underline' }}>
          <InlineText state={state} content={inline.content} />
        </Text>
      );
    }

    return <Text key={index} style={textStyle(inline.styles ?? {})}>{inline.text ?? ''}</Text>;
  });
}

// BlockNote's text styles as PDF styles (the standard fonts have their bold and oblique faces as fonts of their own).
function textStyle(style: Record<string, unknown>) {
  const bold = style['bold'] === true;
  const italic = style['italic'] === true;
  const code = style['code'] === true;
  const family = code ? 'Courier' : 'Helvetica';
  const face = bold && italic ? '-BoldOblique' : bold ? '-Bold' : italic ? '-Oblique' : '';
  const decorations = [style['underline'] === true && 'underline', style['strike'] === true && 'line-through']
    .filter((decoration) => decoration !== false)
    .join(' ');

  return {
    fontFamily: `${family}${face}`,
    ...(decorations === '' ? {} : { textDecoration: decorations as 'underline' }),
  };
}

// The number and the title of an agenda entry: `2. Finance`, `2.1 Annual accounts` (as on the meeting's page).
function numbered(number: string, title: string): string {
  return number.includes('.') ? `${number} ${title}` : `${number}. ${title}`;
}
