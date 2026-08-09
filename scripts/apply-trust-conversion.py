#!/usr/bin/env python3
"""Apply the academic trust/conversion pass idempotently.

The change is intentionally content-first: clearer positioning, consistent academic
branding, a named innovation method, and a lower-friction enquiry flow. The richer
evidence/diagnostic UI lives in assets/js/trust-conversion.js.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace(path: str, old: str, new: str) -> None:
    file = ROOT / path
    text = file.read_text(encoding='utf-8')
    if old in text:
        file.write_text(text.replace(old, new), encoding='utf-8')


# Load the trust/conversion layer from the existing shared story bootstrap.
story = ROOT / 'assets/js/story-unfold.js'
text = story.read_text(encoding='utf-8')
line = "import('/assets/js/trust-conversion.js').catch(error => console.error('Trust and conversion layer failed to load', error));\n"
if line not in text:
    text = text.rstrip() + '\n' + line
    story.write_text(text, encoding='utf-8')

# Canonical visible identity and positioning across public HTML.
for html in ROOT.glob('*.html'):
    text = html.read_text(encoding='utf-8')
    text = text.replace('Dr. Amar Banerjee', 'Dr Amar Banerjee')
    text = text.replace('<strong>Amar Banerjee</strong>', '<strong>Dr Amar Banerjee</strong>')
    text = text.replace('Leadership · Innovation · Facilitation', 'Innovation · Research · Future Readiness')
    text = text.replace('Leadership · Innovation · Research', 'Innovation · Research · Future Readiness')
    html.write_text(text, encoding='utf-8')

# Name the core innovation methodology consistently without making it sound like a gimmick.
replace('index.html', '<span>Student innovation program</span><h2>Move students from “give me a problem statement” to “I found a problem worth solving.”</h2>', '<span>The Problem-to-Proof Method</span><h2>Move students from “give me a problem statement” to “I found a problem worth solving.”</h2>')
replace('workshops.html', '<small>ONE CONNECTED JOURNEY</small>', '<small>THE PROBLEM-TO-PROOF METHOD</small>')
replace('academic-partnerships.html', '<div class="section-head reveal"><span>How the capability is built</span><h2>Innovation becomes credible when students repeatedly practise the thinking sequence.</h2></div>', '<div class="section-head reveal"><span>The Problem-to-Proof Method</span><h2>Innovation becomes credible when students repeatedly practise the thinking sequence.</h2></div>')

# Keep selective-venue ambition academically mature rather than repetitive or promotional.
replace('index.html', 'Why would a top venue care?', 'Why would a selective journal or conference care?')
replace('index.html', '<b>Top-venue ambition</b>', '<b>Selective-venue ambition</b>')
replace('index.html', '<h3>Top-Venue Research Track</h3>', '<h3>Research Excellence Track</h3>')
replace('academic-partnerships.html', '<h3>Top-venue research mindset</h3>', '<h3>Selective-venue research mindset</h3>')
replace('academic-partnerships.html', 'Read top journals and conferences', 'Read leading journals and conferences')

# Keep the research authority page focused on the site's academic audience.
replace('research-ip.html', 'researchers, students, institutions and industry teams', 'researchers, students and academic institutions')
replace('research-ip.html', 'research, IP or industry collaboration conversation', 'academic research or IP conversation')

# Make the enquiry flow feel like a low-risk academic conversation, not a generic contact form.
replace('assets/js/contact-intake.js', '<small>Send a message</small>', '<small>Request an exploratory conversation</small>')
replace('assets/js/contact-intake.js', '<h3>Tell me about your institution and what you are exploring.</h3>', '<h3>Tell me which students you want to think differently.</h3>')
replace('assets/js/contact-intake.js', '<p>A short note is enough. Your email app will open with these details prepared.</p>', '<p>A short note is enough. The first conversation is about fit, cohort and desired capability, not a sales pitch.</p>')
replace('assets/js/contact-intake.js', 'Open email to send', 'Prepare enquiry email')

print('Academic trust/conversion source pass applied.')
