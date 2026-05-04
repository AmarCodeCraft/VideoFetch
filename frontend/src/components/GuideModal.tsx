import React from 'react';
import { BookOpen, Copyright, Download, FileCheck, HardDrive, Scale } from 'lucide-react';

interface GuideSection {
  icon: React.ReactNode;
  title: string;
  content: string[];
}

export function GuideModal() {
  const sections: GuideSection[] = [
    {
      icon: <Copyright className="w-6 h-6" />,
      title: "Copyright & Permissions",
      content: [
        "Only download videos marked as Creative Commons",
        "Check video description for explicit permission",
        "Verify content falls under fair use for educational purposes",
        "Respect content creator's stated usage terms"
      ]
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Download Guidelines",
      content: [
        "Use platform's built-in download feature when available",
        "Prefer official sources over third-party tools",
        "Download in highest quality for archival purposes",
        "Save both video and thumbnails for complete reference"
      ]
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Attribution",
      content: [
        "Always credit the original creator",
        "Include video title and URL in citations",
        "Document date of access and download",
        "Maintain a record of usage permissions"
      ]
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Format Specifications",
      content: [
        "Video: MP4 format for best compatibility",
        "Resolution: Minimum 720p for clarity",
        "Audio: 128kbps or higher for clear sound",
        "Thumbnails: High resolution JPG/PNG"
      ]
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: "Organization",
      content: [
        "Create clear folder hierarchies by subject",
        "Use consistent naming conventions",
        "Include metadata files with source information",
        "Regular backups of educational content"
      ]
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Fair Use Guidelines",
      content: [
        "Purpose: Must be for teaching or research",
        "Nature: Factual content has broader fair use",
        "Amount: Use only what is necessary",
        "Effect: Should not impact market value"
      ]
    }
  ];

  return (
    <div className="glass p-8 rounded-2xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center text-surface-100">Educational Content Usage Guide</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((section) => (
          <div key={section.title} className="glass-light rounded-xl p-5 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                {section.icon}
              </div>
              <h3 className="font-semibold text-surface-100">{section.title}</h3>
            </div>
            <ul className="space-y-2.5">
              {section.content.map((item, index) => (
                <li key={index} className="text-sm text-surface-400 flex items-start">
                  <span className="text-brand-400 mr-2 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}