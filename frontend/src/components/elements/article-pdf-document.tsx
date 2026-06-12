'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Article } from '@/types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 65,
    paddingBottom: 65,
    paddingHorizontal: 50,
    fontSize: 10.5,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
    color: '#2d3748',
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 50,
    right: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#64748b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0f172a',
  },
  meta: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  excerpt: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#475569',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  heading2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    color: '#1e3a8a',
  },
  heading3: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6,
    color: '#1e40af',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  listItem: {
    marginBottom: 4,
    paddingLeft: 12,
  },
});

interface ArticlePdfDocumentProps {
  article: Article;
}

// Convert HTML rich content into styled @react-pdf/renderer blocks
const parseHtmlToPdf = (html: string) => {
  if (!html) return [];

  // Simple HTML structure splitter
  const cleaned = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '</p>\n')
    .replace(/<\/h2>/gi, '</h2>\n')
    .replace(/<\/h3>/gi, '</h3>\n')
    .replace(/<\/li>/gi, '</li>\n');

  const lines = cleaned.split('\n').filter(Boolean);

  return lines.map((line, i) => {
    const textContent = line.replace(/<[^>]+>/g, '').trim();
    if (!textContent) return null;

    if (line.includes('<h2>') || line.includes('<h2 ')) {
      return (
        <Text key={i} style={styles.heading2}>
          {textContent}
        </Text>
      );
    }
    
    if (line.includes('<h3>') || line.includes('<h3 ')) {
      return (
        <Text key={i} style={styles.heading3}>
          {textContent}
        </Text>
      );
    }

    if (line.includes('<li>') || line.includes('<li ')) {
      return (
        <Text key={i} style={styles.listItem}>
          • {textContent}
        </Text>
      );
    }

    return (
      <Text key={i} style={styles.paragraph}>
        {textContent}
      </Text>
    );
  }).filter(Boolean);
};

export function ArticlePdfDocument({ article }: ArticlePdfDocumentProps) {
  const contentHtml = (article as any).content || (article as any).htmlContent || '';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Recurring Header */}
        <View style={styles.header} fixed>
          <Text>DevPulse Engineering Blog</Text>
          <Text>{article.title.substring(0, 45)}{article.title.length > 45 ? '...' : ''}</Text>
        </View>

        {/* Title & Metadata */}
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          By {article.author.name} • {article.publishedAt} • Category: {article.category.name}
        </Text>

        {/* Short Summary Box */}
        <Text style={styles.excerpt}>{article.excerpt}</Text>

        {/* Dynamic Parsed Article Body */}
        <View>
          {contentHtml ? parseHtmlToPdf(contentHtml) : (
            <Text style={styles.paragraph}>No article content body available.</Text>
          )}
        </View>

        {/* Recurring Footer */}
        <View style={styles.footer} fixed>
          <Text>© DevPulse Publications</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
