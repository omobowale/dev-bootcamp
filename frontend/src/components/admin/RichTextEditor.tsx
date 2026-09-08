import { sanitizeRichText } from "../../utils/richText";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../Icon";
import "./RichTextEditor.css";
import { Select } from "../Select";

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

/** Sanitized rich text with a searchable style menu that preserves the editing selection. */
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
  const selectionRef = useRef<Range | null>(null);
  const [textStyle,setTextStyle] = useState("<p>");
  const [activeTools,setActiveTools] = useState<Record<string,boolean>>({});
  useEffect(() => {
    const remember = () => {
      const selection = window.getSelection();
      if (!selection?.rangeCount || !editorRef.current?.contains(selection.anchorNode)) return;
      selectionRef.current = selection.getRangeAt(0).cloneRange();
      const block = document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
      setTextStyle(block === "h3" || block === "h4" ? `<${block}>` : "<p>");
      setActiveTools(Object.fromEntries([...TEXT_TOOLS,...LIST_TOOLS].map(tool => [tool.command,document.queryCommandState(tool.command)])));
    };
    document.addEventListener("selectionchange",remember);
    return () => document.removeEventListener("selectionchange",remember);
  }, []);
  const restoreSelection = () => {
    editorRef.current?.focus();
    const selection=window.getSelection();
    if(selection && selectionRef.current && editorRef.current?.contains(selectionRef.current.commonAncestorContainer)) {
      selection.removeAllRanges(); selection.addRange(selectionRef.current);
    }
  };

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
    restoreSelection();
    document.execCommand(command);
    markEdited();
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const execFormatBlock = (tag: string) => {
    restoreSelection();
    document.execCommand("formatBlock", false, tag);
    markEdited();
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
        <Select
          className="rich-text-editor__style-select"
          aria-label="Text style"
          value={textStyle}
          onChange={(e) => { setTextStyle(e.target.value); execFormatBlock(e.target.value); }}
        >
          {TEXT_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </Select>
        <span className="rich-text-editor__divider" />
        <div className="rich-text-editor__group">
          {TEXT_TOOLS.map((btn) => (
            <button
              key={btn.command}
              type="button"
              className={`rich-text-editor__glyph rich-text-editor__glyph--${btn.glyph}`}
              title={btn.title}
              aria-label={btn.title}
              aria-pressed={!!activeTools[btn.command]}
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
              aria-pressed={!!activeTools[btn.command]}
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
