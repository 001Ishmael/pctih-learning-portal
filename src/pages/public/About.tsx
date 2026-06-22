import { MapPin, Mail, Phone } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-navy mb-4">About PCTIH</h1>
      <p className="text-gray-600 mb-6 leading-relaxed">
        People&apos;s Choice Technology &amp; Innovation Hub (PCTIH) is a training institution based in Freetown, Sierra Leone,
        dedicated to equipping young people and professionals with practical digital and technology skills. Through
        courses, workshops, seminars, and bootcamps, we help our students gain the confidence and competence to thrive
        in today&apos;s digital economy.
      </p>
      <div className="grid sm:grid-cols-3 gap-6 my-10">
        <div className="card p-5">
          <h3 className="font-semibold text-navy mb-2">Our Mission</h3>
          <p className="text-sm text-gray-600">To make quality technology education accessible and affordable for everyone.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-navy mb-2">Our Vision</h3>
          <p className="text-sm text-gray-600">A digitally empowered Sierra Leone where everyone can compete globally.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-navy mb-2">Our Values</h3>
          <p className="text-sm text-gray-600">Excellence, accessibility, integrity, and community impact.</p>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-navy mb-3">Visit Us</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-brand-600" /> 4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone</li>
          <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-brand-600" /> +232 79 468 780</li>
          <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-brand-600" /> peopleschoicet@gmail.com</li>
        </ul>
      </div>
    </div>
  );
}
