import { sanitizeRichText } from "../../utils/richText";
import { useEffect, useRef } from "react";
import { Icon, type IconName } from "../Icon";
import "./RichTextEditor.css";

interface ToolbarButton {
  command: string;
  title: string;
  glyph?: "bold" | "italic" | "underline";
  icon?: IconName;
}

const TEXT_TOOLS: ToolbarButton[] = [
  { command: "bold", title: "Bold", glyph: "bold" },
  { command: "italic", title: "Italic", glyph: "italic" },
  { command: "underline", title: "Underline", glyph: "underline" },
];

const LIST_TOOLS: ToolbarButton[] = [
  { command: "insertUnorderedList", title: "Bullet list", icon: "listBullet" },
  { command: "insertOrderedList", title: "Numbered list", icon: "listNumbered" },
];

const TEXT_STYLES = [
  { value: "<p>", label: "Normal text" },
  { value: "<h3>", label: "Heading" },
  { value: "<h4>", label: "Subheading" },
] as const;

/**
 * A lightweight "fake WYSIWYG" — a contentEditable div with a formatting toolbar driven by
 * document.execCommand. Deliberately not a full rich-text engine (no undo stack management,
 * no paste-cleaning) — this is scoped to what an admin needs for course/FAQ prose: bold,
 * italic, underline, and lists. Stores its value as an HTML string; whatever renders this
 * content publicly must use dangerouslySetInnerHTML (see CourseDetailPage, FaqAccordion) — this
 * is admin-authored content behind login, not public user input.
 *
 * The editor re-syncs its DOM from `value` whenever `value` changes from the OUTSIDE, but stops
 * doing that the moment the user types a first keystroke (tracked via `editedRef`) — after that
 * point it manages its own DOM state, since re-syncing on every keystroke would fight the
 * browser's cursor position. This matters because a parent that loads its initial value
 * asynchronously (e.g. editing an existing course) does NOT have it ready in the exact render
 * where its own loading flag flips to false — there's a one-render gap while the parent's own
 * effect copies query data into local form state — so a mount-only sync would capture an empty
 * string and never pick up the real value once it arrives a render later.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editedRef = useRef(false);

  useEffect(() => {
    if (editedRef.current) return;
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = sanitizeRichText(value);
    }
  }, [value]);

  const markEdited = () => {
    editedRef.current = true;
  };

  const exec = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    markEdited();
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const execFormatBlock = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    markEdited();
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
        <select
          className="rich-text-editor__style-select"
          aria-label="Text style"
          defaultValue="<p>"
          onChange={(e) => execFormatBlock(e.target.value)}
        >
          {TEXT_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        <span className="rich-text-editor__divider" />
        <div className="rich-text-editor__group">
          {TEXT_TOOLS.map((btn) => (
            <button
              key={btn.command}
              type="button"
              className={`rich-text-editor__glyph rich-text-editor__glyph--${btn.glyph}`}
              title={btn.title}
              aria-label={btn.title}
              onClick={() => exec(btn.command)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {btn.glyph === "bold" ? "B" : btn.glyph === "italic" ? "I" : "U"}
            </button>
          ))}
        </div>
        <span className="rich-text-editor__divider" />
        <div className="rich-text-editor__group">
          {LIST_TOOLS.map((btn) => (
            <button
              key={btn.command}
              type="button"
              title={btn.title}
              aria-label={btn.title}
              onClick={() => exec(btn.command)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Icon name={btn.icon as IconName} size={15} />
            </button>
          ))}
        </div>
      </div>
      <div
        ref={editorRef}
        className="rich-text-editor__surface"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder || "Rich text content"}
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={(e) => {
          markEdited();
          onChange(e.currentTarget.innerHTML);
        }}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
