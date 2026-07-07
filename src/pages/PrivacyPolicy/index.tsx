import React from 'react';
import { Container, Typography } from '@mui/material';

// DRAFT (#196): a human must review this text before it ships to production.
// The inventory below must be kept in sync with what the app actually
// collects; update this page when auth, analytics, or the AI backend change.

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <>
    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }}>
      {title}
    </Typography>
    {children}
  </>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="body1" sx={{ mb: 2 }}>
    {children}
  </Typography>
);

const PrivacyPolicy = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h4" component="h1">
      Privacy Policy
    </Typography>
    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
      Last updated: July 6, 2026
    </Typography>

    <Paragraph>
      Bubble Map is a free, open-source mind-mapping tool. This policy describes
      what information the app collects, why, and what happens to it. If you
      have any questions, email us at{' '}
      <a href="mailto:support@bubblemap.app">support@bubblemap.app</a>.
    </Paragraph>

    <Section title="Accounts, including automatic guest accounts">
      <Paragraph>
        When you create an account, we store the information your sign-in method
        provides: your email address, your display name, and an identifier from
        the authentication provider (for example, Google). Authentication is
        handled by Google Firebase Authentication.
      </Paragraph>
      <Paragraph>
        If you open the mind-map area or a shared map without signing in, a
        temporary anonymous guest account is created for you automatically so
        your work can be saved. Guest accounts contain no name or email — just a
        random identifier. You can turn a guest account into a real account
        later, and stale guest accounts are periodically deleted.
      </Paragraph>
    </Section>

    <Section title="Your mind maps">
      <Paragraph>
        The content you create is stored in Google Cloud Firestore: map titles,
        the text of each bubble, and edit history metadata that records which
        accounts created and edited a map and when. If you make a map public or
        share it, people with the link can see its content (and, if you enable
        public editing, change it).
      </Paragraph>
    </Section>

    <Section title="AI and suggestion features">
      <Paragraph>
        When you use the idea-generation panel, the text of the selected bubble
        is sent to our server and forwarded to third-party suggestion services:
        Groq (an AI text-generation provider) and Datamuse (a word association
        service). Only the text needed to generate suggestions is sent;
        don&apos;t put information in a bubble you wouldn&apos;t want processed
        by those services.
      </Paragraph>
    </Section>

    <Section title="Analytics and abuse prevention">
      <Paragraph>
        We use Google Analytics for Firebase and Firebase Performance Monitoring
        to understand usage and keep the app fast. We also use Firebase App
        Check with reCAPTCHA v3, which collects device and browser signals to
        distinguish real users from bots. These services may use cookies or
        similar identifiers.
      </Paragraph>
    </Section>

    <Section title="What we do not do">
      <Paragraph>
        We do not sell your data. We do not use your mind map content for
        advertising or to train AI models. Any ads that may appear on the site
        do not receive your data: we do not share your personal information or
        mind map content with advertising partners. Data is shared only with the
        service providers named above, as needed to run the app.
      </Paragraph>
    </Section>

    <Section title="Children's privacy">
      <Paragraph>
        Bubble Map is designed to be usable by students. We only collect the
        minimum information needed to operate the service, we do not share
        personal information with advertisers, and we do not knowingly collect
        personal information from children under 13 beyond what the features
        above require. If you are a parent or guardian and would like to review
        or delete your child&apos;s information, contact us at{' '}
        <a href="mailto:support@bubblemap.app">support@bubblemap.app</a> and we
        will handle it promptly.
      </Paragraph>
    </Section>

    <Section title="Deleting your data">
      <Paragraph>
        You can delete individual mind maps from within the app, and you can
        delete your account from the Account page. Deleting your account does
        not automatically delete the maps you created, so delete those first —
        or email{' '}
        <a href="mailto:support@bubblemap.app">support@bubblemap.app</a> and we
        will remove everything for you.
      </Paragraph>
    </Section>

    <Section title="Changes to this policy">
      <Paragraph>
        If this policy changes, we will update this page and the date at the
        top.
      </Paragraph>
    </Section>
  </Container>
);

export default PrivacyPolicy;
