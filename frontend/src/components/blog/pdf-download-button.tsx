'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';

import { ArticlePdfDocument } from '@/components/elements/article-pdf-document';
import type { Article } from '@/types';

interface PdfDownloadButtonProps {
  article: Article;
}

export default function PdfDownloadButton({ article }: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<ArticlePdfDocument article={article} />}
      fileName={`${article.slug}.pdf`}
      className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
    >
      {({ loading }) => (
        <span className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
}
