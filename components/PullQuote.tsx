export default function PullQuote({ text }: { text: string }) {
  return (
    <figure className="my-10">
      <blockquote className="pull-quote">{text}</blockquote>
    </figure>
  )
}
