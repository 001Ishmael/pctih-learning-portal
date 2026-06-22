import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How do I register for a course?', a: 'Create an account, browse our courses page, and click "Enroll Now" on the course you want.' },
  { q: 'How do I pay for a paid course or workshop?', a: 'After enrolling, you will see Orange Money payment instructions. Pay to +232 79 468 780, then submit your transaction ID and proof of payment for review.' },
  { q: 'How long does payment approval take?', a: 'Our Finance team typically reviews payments within 24-48 hours. You will be notified once approved.' },
  { q: 'Can I get a refund?', a: 'Refund requests are reviewed case-by-case. Contact us at peopleschoicet@gmail.com.' },
  { q: 'Will I receive a certificate?', a: 'Yes, certificates are issued after successful completion of a course or workshop and can be verified on our Verify Certificate page.' },
  { q: 'Are there free courses?', a: 'Yes! Some of our programs, like Digital Literacy and STEM for Kids, are completely free.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-navy mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Answers to common questions about PCTIH programs.</p>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={f.q} className="card">
            <button
              className="w-full flex items-center justify-between p-4 text-left font-medium text-navy"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {f.q}
              <ChevronDown className={`h-4 w-4 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && <p className="px-4 pb-4 text-sm text-gray-600">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
