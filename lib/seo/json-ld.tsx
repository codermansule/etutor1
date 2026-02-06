import React from "react";

/* -------------------------------------------------------------------------- */
/*  Organization JSON-LD                                                      */
/* -------------------------------------------------------------------------- */

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ETUTOR",
    url: "https://etutor.studybitests.com",
    logo: "https://etutor.studybitests.com/logo.png",
    sameAs: ["https://www.linkedin.com/company/etutor"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "support@etutor.studybitests.com",
        contactType: "customer support",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQPage JSON-LD                                                           */
/* -------------------------------------------------------------------------- */

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageJsonLdProps {
  faqs: FAQItem[];
}

export function FAQPageJsonLd({ faqs }: FAQPageJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Course JSON-LD                                                            */
/* -------------------------------------------------------------------------- */

interface CourseJsonLdProps {
  name: string;
  description: string;
  provider?: string;
}

export function CourseJsonLd({
  name,
  description,
  provider = "ETUTOR",
}: CourseJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
      url: "https://etutor.studybitests.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Breadcrumb JSON-LD                                                        */
/* -------------------------------------------------------------------------- */

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
