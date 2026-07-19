/**
 * Thin per-section wrappers around ContentArchivePage, so each archive gets its
 * own route and lazy chunk without three near-identical page files.
 */
import ContentArchivePage from './ContentArchivePage';
import { CONTENT_TYPES } from '../../shared/hooks/useContent';

export function AnnouncementsArchivePage() {
  return (
    <ContentArchivePage
      type={CONTENT_TYPES.announcement}
      title="Announcements"
      intro="Official notices from the Municipal Social Welfare and Development Office, newest first. Past announcements are kept here for reference."
    />
  );
}

export function NewsArchivePage() {
  return (
    <ContentArchivePage
      type={CONTENT_TYPES.news}
      title="News & Events"
      intro="Reports on MSWD Caba activities, outreach, and programme milestones."
    />
  );
}

export function FaqArchivePage() {
  return (
    <ContentArchivePage
      type={CONTENT_TYPES.faq}
      title="Frequently Asked Questions"
      intro="Answers to the questions most often asked at the MSWD office. If your question is not here, visit or call the office during office hours."
    />
  );
}
