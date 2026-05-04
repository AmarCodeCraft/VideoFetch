export function checkFairUse(purpose: string, usage: string, amount: string): boolean {
  const educationalPurposes = [
    'teaching',
    'research',
    'scholarship',
    'criticism',
    'comment',
    'news reporting'
  ];

  const isEducational = educationalPurposes.some(p => 
    purpose.toLowerCase().includes(p.toLowerCase())
  );

  const isLimitedUsage = usage === 'noncommercial';
  const isReasonableAmount = amount === 'partial' || amount === 'small';

  return isEducational && isLimitedUsage && isReasonableAmount;
}

export function generateCitation(videoInfo: {
  title: string;
  author: string;
  url: string;
  accessDate: Date;
}): string {
  const date = videoInfo.accessDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `${videoInfo.author}. (${date}). ${videoInfo.title} [Video]. YouTube. ${videoInfo.url}`;
}