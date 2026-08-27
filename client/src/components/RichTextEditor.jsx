import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl text-sm">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded font-bold ${editor.isActive('bold') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded font-bold ${editor.isActive('italic') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded font-bold ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className={`px-3 py-1.5 rounded font-bold ${editor.isActive('link') ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
      >
        Link
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Pass HTML output back to parent form
    },
  });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-primary transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="p-4 min-h-[250px] outline-none prose max-w-none text-gray-800" />
    </div>
  );
}