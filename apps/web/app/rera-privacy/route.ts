/**
 * Privacy policy for the RERA Exam Prep Dubai iOS app.
 *
 * Served as a raw, self-contained HTML document via a route handler rather
 * than a page.tsx: the document is styled to match the iOS app (light paper,
 * its own inline CSS) and must not inherit the site's global stylesheet or
 * dark-theme default, which the root layout applies to every page.
 */
export const dynamic = "force-static";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy Policy — RERA Exam Prep Dubai</title>
<meta name="description" content="Privacy policy for the RERA Exam Prep Dubai iOS app. No accounts, no tracking, no data collection.">
<style>
  :root{
    --paper:#FAF7F2;
    --paper-raised:#FFFDF9;
    --ink:#1C1B19;
    --ink-muted:#5B564E;
    --ink-faint:#8A837A;
    --indigo:#2D3A8C;
    --rule:#E3DCD1;
    --serif:"Source Serif 4",ui-serif,"New York",Georgia,serif;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{
    margin:0;padding:0;background:var(--paper);color:var(--ink);
    font-family:var(--sans);font-size:17px;line-height:1.65;
    -webkit-text-size-adjust:100%;
  }
  .wrap{max-width:44rem;margin:0 auto;padding:2.5rem 1.5rem 4rem}
  header{border-bottom:1px solid var(--rule);padding-bottom:1.5rem;margin-bottom:2rem}
  .eyebrow{
    font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;
    color:var(--indigo);font-weight:600;margin:0 0 .5rem
  }
  h1{font-family:var(--serif);font-size:2rem;line-height:1.2;margin:0 0 .5rem;font-weight:600}
  .dates{font-size:.875rem;color:var(--ink-faint);margin:0}
  h2{
    font-family:var(--serif);font-size:1.3rem;line-height:1.3;
    margin:2.5rem 0 .75rem;font-weight:600
  }
  h3{font-size:1rem;margin:1.5rem 0 .5rem;font-weight:600}
  p{margin:0 0 1rem}
  ul{margin:0 0 1rem;padding-left:1.25rem}
  li{margin-bottom:.4rem}
  a{color:var(--indigo)}
  strong{font-weight:600}
  .callout{
    background:var(--paper-raised);border:1px solid var(--rule);
    border-left:3px solid var(--indigo);
    border-radius:4px;padding:1.15rem 1.25rem;margin:1.5rem 0
  }
  .callout p:last-child{margin-bottom:0}
  .callout .label{
    font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
    color:var(--indigo);font-weight:600;display:block;margin-bottom:.4rem
  }
  footer{
    margin-top:3.5rem;padding-top:1.5rem;border-top:1px solid var(--rule);
    font-size:.875rem;color:var(--ink-faint)
  }
  footer p{margin:0 0 .5rem}
  @media (max-width:480px){
    body{font-size:16px}
    .wrap{padding:2rem 1.15rem 3rem}
    h1{font-size:1.65rem}
  }
</style>
</head>
<body>
<div class="wrap">

<header>
  <p class="eyebrow">RERA Exam Prep Dubai</p>
  <h1>Privacy Policy</h1>
  <p class="dates">Effective 5 August 2026 · Last updated 5 August 2026</p>
</header>

<div class="callout">
  <span class="label">In short</span>
  <p>This app does not collect your data. There is no account, no sign-up, and no
  tracking. Everything you do stays on your device. We have no server and no way to
  see how you use the app.</p>
</div>

<p>This policy explains how the iOS application <strong>RERA Exam Prep Dubai —
Unofficial Practice Tests</strong> (the "app") handles information. It is published by
Aimal Mazidi Real Estate LLC, Dubai, United Arab Emirates ("we", "us"), which is the
data controller for the purposes of this policy.</p>

<h2>1. Information we collect</h2>

<p><strong>We collect no personal data.</strong> Specifically, the app does not collect,
transmit, store on our systems, or share:</p>

<ul>
  <li>Your name, email address, phone number, or any contact details</li>
  <li>Account credentials — the app has no accounts and no sign-in</li>
  <li>Device identifiers, advertising identifiers, or IP address logs</li>
  <li>Location data</li>
  <li>Usage analytics, session recordings, or behavioural data</li>
  <li>Contacts, photos, calendar, microphone, or camera data</li>
  <li>Payment or card details</li>
</ul>

<p>The app contains no analytics software, no advertising software, no attribution or
marketing tools, and no third-party tracking of any kind.</p>

<h2>2. Information stored on your device</h2>

<p>To make the app work, the following is saved locally on your iPhone or iPad:</p>

<ul>
  <li>Which questions you have answered, and whether each was correct</li>
  <li>Your mock exam scores and history</li>
  <li>Per-topic accuracy, used to show your progress</li>
  <li>App preferences, such as appearance settings</li>
</ul>

<p>This information never leaves your device. It is not backed up to any server we
control. It may be included in your own encrypted iCloud or iTunes device backup, which
is managed entirely by Apple under Apple's terms — we have no access to it.</p>

<p>You can erase all of it at any time using <strong>Reset Progress</strong> in the
app's settings, or by deleting the app.</p>

<h2>3. Internet use</h2>

<p>The app is designed to work offline and does not require an internet connection to
study.</p>

<p>The only outbound connection occurs when you tap a citation to read the underlying
legislation. This opens the official Dubai Land Department or Dubai Legislation source
page in an in-app browser. When you do this, your device connects directly to that
government website, which is governed by its own privacy policy and not by ours. We
receive no information about this and do not track which links you open.</p>

<h2>4. Purchases</h2>

<p>Purchases are processed entirely by Apple through the App Store. We never see, handle,
or store your payment card details, billing address, or Apple ID.</p>

<p>Apple confirms to the app whether a purchase is valid so that content can be unlocked.
That confirmation contains no personal information about you. Apple's own handling of
your purchase is covered by
<a href="https://www.apple.com/legal/privacy/">Apple's Privacy Policy</a>.</p>

<h2>5. Third parties</h2>

<p>The app uses no third-party software development kits, no advertising networks, and
no external services other than Apple's own in-app purchase system. We do not sell,
rent, or share information with anyone, because we do not hold any.</p>

<h2>6. Children</h2>

<p>The app is a professional study aid intended for adults preparing for a Dubai real
estate broker examination. It is not directed at children and we do not knowingly
collect information from anyone of any age — because we collect no information at all.</p>

<h2>7. Your rights</h2>

<p>Data protection law, including the UAE Federal Decree-Law No. 45 of 2021 on the
Protection of Personal Data and the EU and UK General Data Protection Regulation, gives
individuals rights to access, correct, delete, and port their personal data, and to
object to its processing.</p>

<p>Because we hold no personal data about you, there is nothing for us to disclose,
correct, transfer, or erase. The study data on your device is under your sole control
and can be deleted at any time from within the app. If you would like to exercise a
right or ask a question, contact us using the details below and we will respond.</p>

<h2>8. Security</h2>

<p>Your study data is stored within the app's own storage area on your device, protected
by iOS. Because nothing is transmitted to us, there is no server-side store of your
information that could be exposed.</p>

<h2>9. Changes to this policy</h2>

<p>If the app changes in a way that affects this policy — for example if a future version
introduces optional accounts or synchronisation — we will update this page and revise the
effective date above before that version is released. Material changes will also be noted
in the App Store release notes.</p>

<h2>10. Contact</h2>

<p>Aimal Mazidi Real Estate LLC<br>
Dubai, United Arab Emirates<br>
Email: <a href="mailto:support@mazidigroup.com">support@mazidigroup.com</a></p>

<footer>
  <p><strong>Not affiliated.</strong> This app is an independent study aid. It is not
  affiliated with, endorsed by, or connected to the Dubai Land Department, the Real
  Estate Regulatory Agency, or the Dubai Real Estate Institute. It does not issue any
  licence, certificate, or qualification.</p>
  <p>© 2026 Aimal Mazidi Real Estate LLC</p>
</footer>

</div>
</body>
</html>
`;

export function GET(): Response {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
