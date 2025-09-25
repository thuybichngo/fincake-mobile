import React from 'react';
import Markdown, { MarkdownProps } from 'react-native-markdown-display';
import { StyleSheet } from 'react-native';

type Props = { content: string } & Partial<MarkdownProps>;

export default function RNMarkdown({ content, ...rest }: Props) {
  return (
    <Markdown style={markdownStyles} {...rest}>
      {content}
    </Markdown>
  );
}

const markdownStyles = StyleSheet.create({
  body: { color: '#111827', fontSize: 15, lineHeight: 22 },
  heading1: { fontSize: 20, marginBottom: 8 },
  heading2: { fontSize: 18, marginBottom: 6 },
  heading3: { fontSize: 16, marginBottom: 6 },
  bullet_list: { marginVertical: 6 },
  ordered_list: { marginVertical: 6 },
  list_item: { marginVertical: 2 },
  table: { borderWidth: 1, borderColor: '#e5e7eb', marginVertical: 8 },
  thead: { backgroundColor: '#f3f4f6' },
  th: { padding: 6, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  tbody: {},
  tr: { borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  td: { padding: 6, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  code_inline: { backgroundColor: '#f3f4f6', paddingHorizontal: 4, borderRadius: 4 },
});


