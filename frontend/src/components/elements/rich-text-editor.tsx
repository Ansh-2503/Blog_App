'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Code,
  RemoveFormatting,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your article...',
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Sync value from parent to editor once on mount
  useEffect(() => {
    if (editorRef.current && !isMounted) {
      editorRef.current.innerHTML = value;
      setIsMounted(true);
    }
  }, [value, isMounted]);

  // Sync value if parent changes it externally (like when loading saved data)
  useEffect(() => {
    if (editorRef.current && isMounted && value !== editorRef.current.innerHTML) {
      // Save cursor position if possible or just update
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      editorRef.current.innerHTML = value;
      
      // Restore selection if focus is in editor
      if (range && selection && editorRef.current.contains(range.commonAncestorContainer)) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [value, isMounted]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const addLink = () => {
    const url = prompt('Enter the link URL (e.g., https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => executeCommand('bold') },
    { icon: Italic, label: 'Italic', action: () => executeCommand('italic') },
    { icon: Underline, label: 'Underline', action: () => executeCommand('underline') },
    { icon: Heading2, label: 'Heading 2', action: () => executeCommand('formatBlock', '<h2>') },
    { icon: Heading3, label: 'Heading 3', action: () => executeCommand('formatBlock', '<h3>') },
    { icon: List, label: 'Bullet List', action: () => executeCommand('insertUnorderedList') },
    { icon: ListOrdered, label: 'Numbered List', action: () => executeCommand('insertOrderedList') },
    { icon: Link2, label: 'Link', action: addLink },
    { icon: Code, label: 'Code Block', action: () => executeCommand('formatBlock', '<pre>') },
    { icon: RemoveFormatting, label: 'Clear Format', action: () => executeCommand('removeFormat') },
  ];

  return (
    <div className={cn('flex flex-col rounded-xl border border-border bg-card overflow-hidden', className)}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2 shrink-0">
        {toolbarButtons.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={action}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground px-2">HTML Rich Text Editor</span>
      </div>

      {/* Editor Body */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[400px] flex-1 overflow-y-auto px-6 py-4 outline-none prose max-w-none dark:prose-invert focus:ring-1 focus:ring-ring/20"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
