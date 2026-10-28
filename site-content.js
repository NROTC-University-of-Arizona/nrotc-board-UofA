// Public content only. Paths are relative to this file's folder on GitHub Pages.
// Keep previous weeks here so readers can select older PDFs.
window.SITE_CONTENT = {
  // Update this timestamp when published website content changes, never on each visit.
  lastUpdatedAt: '2026-10-28T18:55:17Z',
  // Updates use { title, body, postedAt, expiresAt } with explicit timezone offsets.
  urgentUpdates: [],
  // Use only owner-supplied forms and requirements. A reference can replace a form URL.
  // Optional dueAt values use Tucson's explicit offset, and display in military time.
  rotcForms: [
    {
      label: 'MIDN Evaluations',
      dueAt: '2026-11-06T16:00:00-07:00',
      reference: 'See Appendix 3-A of the SOP.'
    }
  ],
  // Feedback is collected through the linked Google Form.
  feedbackFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScSVx4asIgXIUOtr2Dn0xjIAz7ViJmSeSv6hYk-5E_SsQ2rAA/viewform?usp=publish-editor', 
  weeks: [
    {
      id: '2026-10-25',
      label: 'POW 10 · October 25–31, 2026',
      powUrl: 'documents/pow-2026-10-25.pdf',
      bulletinUrl: 'https://docs.google.com/document/d/1AiHiwlf3jOCOGjx7nE92hWKIOsCIBxa97rZZ1was68g/edit?usp=sharing'
    },
    {
      id: '2026-10-11',
      label: 'POW 8 · October 11–17, 2026',
      powUrl: 'documents/pow-8.pdf',
      bulletinUrl: 'https://docs.google.com/document/d/1YS1rmJXDqIFLr2IxROJ9zJuVc-Afidoo2eRobpgz08k/edit?usp=sharing'
    },
    {
      id: '2026-10-18',
      label: 'POW 9 · October 18–24, 2026',
      powUrl: 'documents/pow-9.pdf',
      bulletinUrl: 'https://docs.google.com/document/d/1AiHiwlf3jOCOGjx7nE92hWKIOsCIBxa97rZZ1was68g/edit'
    }
  ],
  // Example week: { id: '2026-10-19', label: 'October 19–25, 2026',
  //   powUrl: 'documents/pow-2026-10-19.pdf', bulletinUrl: 'documents/bulletin-2026-10-19.pdf' }
  // Use the ID of the week to display first; an empty value selects the newest entry.
  featuredWeekId: '2026-10-25',
  clubs: [
  {
    "id": "semper-fi",
    "name": "Semper Fi Club",
    "description": "Photos from the club.",
    "posts": [
      {
        "title": "Together on the trail",
        "imageUrl": "assets/clubs/semper-fi/img_3699.jpeg",
        "imageAlt": "Semper Fi Club group posing among desert cacti."
      },
      {
        "title": "At the overlook",
        "imageUrl": "assets/clubs/semper-fi/img_3679.jpeg",
        "imageAlt": "Semper Fi Club group at a mountain overlook with the city behind them."
      },
      {
        "title": "On the move",
        "imageUrl": "assets/clubs/semper-fi/img_3693.jpeg",
        "imageAlt": "Club members carrying packs along a hillside road."
      },
      {
        "title": "Desert ruck",
        "imageUrl": "assets/clubs/semper-fi/img_3697.jpeg",
        "imageAlt": "Club members carrying packs on a desert trail surrounded by saguaros."
      }
    ]
  },
  {
    "id": "spec-war",
    "name": "Spec War Club",
    "description": "",
    "posts": []
  }
]
  // Example club: { id: 'example-club', name: 'Club name', description: 'About the club',
  //   posts: [{ title: 'Event title', date: '2026-10-23', time: '1600',
  //     location: 'Meeting location', body: 'Event details',
  //     imageUrl: 'assets/clubs/example.jpg', imageAlt: 'Description of the photo' }] }
};
