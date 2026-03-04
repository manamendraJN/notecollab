import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote,
    AlignLeft, AlignCenter, AlignRight, Code, Undo, Redo, Link2,
} from 'lucide-react';
import { useEffect, useCallback } from 'react';

const ToolbarButton = ({ onClick, active, title, children, disabled }) => (
    <button
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded-lg transition-all hover:bg-white/10 disabled:opacity-30 ${active ? 'text-white' : ''
            }`}
        style={{ background: active ? 'var(--color-accent)' : 'transparent', color: active ? '#fff' : 'var(--color-muted)' }}
    >
        {children}
    </button>
);

const Divider = () => (
    <div className="w-px h-5 mx-1 self-center" style={{ background: 'var(--color-border)' }} />
);

const RichEditor = ({ content, onChange, readOnly = false, placeholder = 'Start writing your note...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable strike since we're using it from StarterKit
            }),
            Placeholder.configure({ placeholder }),
            Highlight.configure({ multicolor: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Link.configure({ openOnClick: false, autolink: true }),
        ],
        content: content || '',
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    // Sync external content changes (when switching notes)
    useEffect(() => {
        if (!editor) return;
        const currentHTML = editor.getHTML();
        if (content !== currentHTML) {
            editor.commands.setContent(content || '', false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Toolbar */}
            {!readOnly && (
                <div
                    className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b sticky top-0 z-10"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
                        <Undo size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
                        <Redo size={15} />
                    </ToolbarButton>

                    <Divider />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                        <Heading1 size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                        <Heading2 size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                        <Heading3 size={15} />
                    </ToolbarButton>

                    <Divider />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                        <Bold size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                        <Italic size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                        <UnderlineIcon size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                        <Strikethrough size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
                        <Highlighter size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
                        <Link2 size={15} />
                    </ToolbarButton>

                    <Divider />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                        <List size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
                        <ListOrdered size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                        <Quote size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
                        <Code size={15} />
                    </ToolbarButton>

                    <Divider />

                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left">
                        <AlignLeft size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
                        <AlignCenter size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right">
                        <AlignRight size={15} />
                    </ToolbarButton>
                </div>
            )}

            {/* Editor content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
};

export default RichEditor;
