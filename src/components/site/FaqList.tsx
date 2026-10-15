import type { Faq } from "@/content/faqs";

/** Native <details> disclosure: keyboard and screen-reader friendly, no JS. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-paper">
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-5 py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
            {faq.question}
            <svg
              viewBox="0 0 16 16"
              className="size-4 shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              aria-hidden="true"
            >
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <p className="pb-4 text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
