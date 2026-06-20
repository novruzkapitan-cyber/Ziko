import React from 'react';

interface ExplanationTextProps {
  text: string;
}

export default function ExplanationText({ text }: ExplanationTextProps) {
  if (!text) return null;

  // Simple, robust custom Markdown and line parsing for child friendliness
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-slate-700 leading-relaxed text-sm antialiased" id="explanation-container">
      {lines.map((line, index) => {
        let trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }

        // Check for Headers
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={index} className="text-base font-bold text-slate-800 mt-3 mb-1" id={`h4-${index}`}>
              {parseBold(trimmed.replace(/^###\s*/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('##')) {
          return (
            <h3 key={index} className="text-lg font-bold text-slate-900 mt-4 mb-2 border-b border-slate-100 pb-1" id={`h3-${index}`}>
              {parseBold(trimmed.replace(/^##\s*/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('#')) {
          return (
            <h2 key={index} className="text-xl font-extrabold text-indigo-900 mt-4 mb-2" id={`h2-${index}`}>
              {parseBold(trimmed.replace(/^#\s*/, ''))}
            </h2>
          );
        }

        // Check for lists
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={index} className="flex gap-2 items-start pl-3 py-0.5" id={`list-item-${index}`}>
              <span className="text-indigo-500 font-bold select-none mt-1">•</span>
              <span className="flex-grow">{parseBold(content)}</span>
            </div>
          );
        }

        // Check for numeric lists like "1) " or "1. "
        const numericMatch = trimmed.match(/^(\d+[\).])\s*(.*)/);
        if (numericMatch) {
          const prefix = numericMatch[1];
          const content = numericMatch[2];
          return (
            <div key={index} className="flex gap-2 items-start pl-3 py-0.5" id={`num-list-item-${index}`}>
              <span className="text-indigo-600 font-bold select-none min-w-[20px]">{prefix}</span>
              <span className="flex-grow">{parseBold(content)}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="py-0.5" id={`para-${index}`}>
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Simple bold parser that replaces **text** with standard React elements
function parseBold(str: string): React.ReactNode {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-slate-900 bg-indigo-50/60 px-1 rounded">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}
