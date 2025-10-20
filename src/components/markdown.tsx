import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export const Markdown: React.FC<{ content: string; innerMb?: number }> = ({
  content,
  innerMb = 2,
}) => (
  <div className='markdown text-md text-foreground w-full'>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ children }) => (
          <code className='inline-block rounded-sm max-w-full whitespace-pre-wrap overflow-auto bg-muted align-middle px-2 py-0.5'>
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className={`bg-muted py-2 rounded-sm mb-${innerMb}`}>{children}</pre>
        ),

        p: ({
          children,
        }: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLParagraphElement>,
          HTMLParagraphElement
        >) => <p className={`max-w-full mb-${innerMb}`}>{children}</p>,

        strong: (props) => <b className='font-bold' {...props} />,
        b: (props) => <b className='font-bold' {...props} />,

        em: (props: React.PropsWithChildren) => {
          const { children } = props;
          return <em className='max-w-full'>{children}</em>;
        },

        blockquote: (props: React.PropsWithChildren) => {
          const { children } = props;
          return <blockquote className='p-2 max-w-full'>{children}</blockquote>;
        },

        ol: ({
          children,
        }: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>) => (
          <ol className={`list-decimal pl-4 mb-${innerMb}`}>{children}</ol>
        ),

        ul: ({
          children,
        }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
          <ul className={`max-w-full pl-4 mb-${innerMb} list-disc`}>{children}</ul>
        ),
        li: (props: React.PropsWithChildren) => (
          <li className='max-w-full mb-1 align-middle align' {...props} />
        ),

        hr: (props: React.PropsWithChildren) => <Separator className='my-2' {...props} />,

        a: (props) => (
          <a
            className='text-blue-700 dark:text-blue-400 hover:underline'
            target='_blank'
            {...props}
          />
        ),

        img: (p) => <img className='max-w-full object-contain' {...p} />,

        h1: (props: React.PropsWithChildren) => (
          <h1 className={`text-3xl mb-${innerMb}`} {...props} />
        ),
        h2: (props: React.PropsWithChildren) => (
          <h2 className={`text-2xl mb-${innerMb}`} {...props} />
        ),
        h3: (props: React.PropsWithChildren) => (
          <h3 className={`text-xl mb-${innerMb}`} {...props} />
        ),
        h4: (props: React.PropsWithChildren) => (
          <h4 className={`text-lg mb-${innerMb}`} {...props} />
        ),
        h5: (props: React.PropsWithChildren) => (
          <h5 className={`text-md mb-${innerMb}`} {...props} />
        ),
        h6: (props: React.PropsWithChildren) => (
          <h6 className={`text-sm mb-${innerMb}`} {...props} />
        ),

        table: Table,
        tbody: TableBody,
        td: TableCell,
        thead: TableHeader,
        th: TableHead,
        tr: TableRow,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);
