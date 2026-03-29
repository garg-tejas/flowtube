type LinkifyTextProps = {
  text: string
  className?: string
}

export function LinkifyText({ text, className }: LinkifyTextProps) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g

  const parts = text.split(urlRegex)

  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {part}
            </a>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </p>
  )
}
