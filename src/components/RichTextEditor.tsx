import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  type EditorState,
  type LexicalEditor,
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Theme configuration for Lexical
const theme = {
  paragraph: "mb-2",
  heading: {
    h2: "text-2xl font-bold mb-3 mt-4",
    h3: "text-xl font-bold mb-2 mt-3",
  },
  list: {
    ul: "list-disc list-inside mb-2",
    ol: "list-decimal list-inside mb-2",
    listitem: "ml-4",
  },
  quote: "border-l-4 border-blue-600 pl-4 italic my-3",
  link: "text-blue-600 hover:underline",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
};

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: "bold" | "italic") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode("h2"));
      }
    });
  };

  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const insertQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg flex-wrap">
      <button
        type="button"
        onClick={undo}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={redo}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={formatHeading}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={() => formatText("bold")}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => formatText("italic")}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={insertBulletList}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={insertNumberedList}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      <button
        type="button"
        onClick={insertQuote}
        className="p-2 hover:bg-slate-200 rounded transition-colors"
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
    </div>
  );
}

// Plugin to sync HTML content with parent component
function HtmlPlugin({
  onChange,
  initialValue,
}: {
  onChange: (html: string) => void;
  initialValue: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && initialValue && initialValue.trim() !== "") {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialValue, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();

        if (nodes.length > 0) {
          nodes.forEach((node) => {
            root.append(node);
          });
        }
      });
      setInitialized(true);
    }
  }, [editor, initialValue, initialized]);

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange(htmlString);
    });
  };

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Mulai menulis konten artikel...",
  className = "",
}) => {
  const initialConfig = {
    namespace: "ArticleEditor",
    theme,
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  };

  return (
    <div
      className={`rich-text-editor border border-slate-200 rounded-lg overflow-hidden bg-white ${className}`}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] p-4 outline-none prose prose-slate max-w-none focus:outline-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-slate-400 pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={() => <div>Error loading editor</div>}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <HtmlPlugin onChange={onChange} initialValue={value} />
      </LexicalComposer>
    </div>
  );
};

export default RichTextEditor;
