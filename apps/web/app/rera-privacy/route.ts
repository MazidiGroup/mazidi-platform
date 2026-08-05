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
  <p>There is no account and no sign-up. Your study progress, answers, and scores stay
  on your device and are never sent to us. The only information that leaves your device
  is what is needed to process and restore your purchase, handled by Apple and by our
  purchase provider, RevenueCat. We do not track how you study and we run no analytics
  or advertising.</p>
</div>

<p>This policy explains how the iOS application <strong>RERA Exam Prep Dubai —
Unofficial Practice Tests</strong> (the "app") handles information. It is published by
Aimal Mazidi Real Estate LLC, Dubai, United Arab Emirates ("we", "us"), which is the
data controller for the purposes of this policy.</p>

<h2>1. Information we collect</h2>

<p><strong>We do not ask you for any personal information.</strong> The app does not
collect, transmit, or store:</p>

<ul>
  <li>Your name, email address, phone number, or any contact details</li>
  <li>Account credentials — the app has no accounts and no sign-in</li>
  <li>Advertising identifiers, or any identifier used to track you across apps</li>
  <li>Location data</li>
  <li>Usage analytics, session recordings, or behavioural data</li>
  <li>Contacts, photos, calendar, microphone, or camera data</li>
  <li>Payment card details</li>
</ul>

<p>The app contains no analytics software, no advertising software, no attribution or
marketing tools, and no cross-app tracking.</p>

<p>The one exception is purchase information. To sell you the unlock and to restore it
if you change device, limited purchase data is processed by Apple and by RevenueCat.
This is described in section 4.</p>

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

<p>The app is designed to work offline. You can study, take mock exams, and review
your answers with no internet connection.</p>

<p>The app connects to the internet in only two situations:</p>

<ul>
  <li><strong>Purchases.</strong> When you buy or restore the unlock, the app contacts
  Apple and RevenueCat to validate and record it. See section 4.</li>
  <li><strong>Reading the law.</strong> When you tap a citation, the official Dubai Land
  Department or Dubai Legislation page opens in an in-app browser. Your device connects
  directly to that government website, which is governed by its own privacy policy. We
  receive no information about this and do not record which links you open.</li>
</ul>

<h2>4. Purchases</h2>

<p>Payment is taken entirely by Apple through the App Store. <strong>We never see,
handle, or store your payment card details, billing address, or Apple ID.</strong>
Apple's handling of your purchase is covered by
<a href="https://www.apple.com/legal/privacy/">Apple's Privacy Policy</a>.</p>

<p>To manage entitlements and to let you restore a purchase on a new device, we use
<a href="https://www.revenuecat.com/privacy/">RevenueCat, Inc.</a>, a purchase
infrastructure provider based in the United States. RevenueCat acts as our processor.
When you make or restore a purchase, the following may be processed on its servers:</p>

<ul>
  <li>An anonymous identifier generated by RevenueCat for your installation of the app.
  It is not your name, email, or Apple ID, and it is not shared with advertisers or used
  to track you across other apps.</li>
  <li>The App Store receipt for your purchase, and your purchase and restore history for
  this app</li>
  <li>Basic technical details such as country, platform, device model, and app version</li>
</ul>

<p>This data exists so that the app can tell whether you have paid. We use it only to
unlock content, to restore purchases, and to see anonymous totals of how many purchases
have been made. It is not linked to your identity, and we cannot use it to identify you.</p>

<p><strong>International transfer.</strong> RevenueCat processes this data on servers in
the United States, so purchase data leaves the UAE. The transfer is necessary to perform
the contract with you — that is, to deliver the content you paid for — and is covered by
our agreement with RevenueCat.</p>

<p><strong>Retention.</strong> Purchase records are kept by RevenueCat for as long as the
app is available, because a restore may be requested at any time on a new device. Apple
retains transaction records under its own policies.</p>

<h2>5. Third parties</h2>

<p>The app includes one third-party software development kit: <strong>RevenueCat</strong>,
used solely for purchase validation and restore, as described in section 4.</p>

<p>There are no advertising networks, no analytics providers, no attribution or marketing
tools, and no social media SDKs. We do not sell or rent information to anyone, and we do
not share it for advertising or any purpose unrelated to delivering what you bought.</p>

<h2>6. Children</h2>

<p>The app is a professional study aid intended for adults preparing for a Dubai real
estate broker examination. It is not directed at children, we do not knowingly collect
information from children, and no part of the app is designed to appeal to them.</p>

<h2>7. Your rights</h2>

<p>Data protection law, including the UAE Federal Decree-Law No. 45 of 2021 on the
Protection of Personal Data and the EU and UK General Data Protection Regulation, gives
individuals rights to access, correct, delete, and port their personal data, and to
object to its processing.</p>

<p>Because the app has no accounts, we hold almost nothing about you. Your study data
is under your sole control and can be erased at any time using <strong>Reset
Progress</strong> or by deleting the app; we never receive it and cannot access it.</p>

<p>The only records associated with you are the anonymous purchase records described in
section 4. If you would like these deleted, contact us with your App Store transaction
or order ID and we will ask RevenueCat to erase the corresponding record. Please note
that doing so may prevent you from restoring your purchase on a new device without
buying it again, and that Apple retains its own transaction records independently of us.</p>

<p>To exercise any right or ask a question, contact us using the details in section 10.
We will respond within 30 days. You also have the right to complain to your local data
protection authority.</p>

<h2>8. Security</h2>

<p>Your study data is stored within the app's own storage area on your device, protected
by iOS. It is never transmitted, so there is no server-side copy of your answers, scores,
or progress that could be exposed.</p>

<p>Purchase data is transmitted over encrypted connections and held by Apple and
RevenueCat under their own security arrangements. We do not operate any server of our
own in connection with this app.</p>

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
