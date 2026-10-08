"""Render the verified résumé data as a readable, two-page professional PDF."""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer

sys.stdin.reconfigure(encoding="utf-8")
data = json.load(sys.stdin)
profile, contact = data["profile"], data["contact"]
output = Path(sys.argv[1])
output.parent.mkdir(parents=True, exist_ok=True)
blue = colors.HexColor("#1d4ed8")
ink = colors.HexColor("#172033")
muted = colors.HexColor("#475569")
rule = colors.HexColor("#cbd5e1")


def text(value):
    return escape(value.replace("—", " - ").replace("–", "-").replace("’", "'").replace("→", "/"))


def style(name, size, leading, color=ink, bold=False, after=0):
    return ParagraphStyle(name, fontName="Helvetica-Bold" if bold else "Helvetica", fontSize=size,
                          leading=leading, textColor=color, alignment=TA_LEFT, spaceAfter=after)


body = style("Body", 10, 14, after=5)
small = style("Meta", 9, 12.5, muted, after=3)
heading = style("Heading", 10, 14, blue, bold=True, after=10)
project_title = style("Project", 11, 15, bold=True, after=2)
bullet = style("Bullet", 9.5, 13, after=3)
bullet.leftIndent = 10
bullet.firstLineIndent = -7
project_style = style("ProjectBrief", 9.5, 13, after=7)


def section(title):
    return [Spacer(1, 10), HRFlowable(width="100%", thickness=0.6, color=rule),
            Spacer(1, 9), Paragraph(title, heading)]


story = [
    Paragraph(text(profile["name"]), style("Name", 27, 32, blue, bold=True, after=4)),
    Paragraph(text(profile["role"]), style("Role", 12, 17, bold=True, after=8)),
    Paragraph(text(profile["location"]) + ' &nbsp; | &nbsp; '
              + f'<link href="mailto:{escape(contact["email"])}" color="#1d4ed8">{text(contact["email"])}</link>', small),
    Paragraph(f'<link href="{escape(contact["github"])}" color="#1d4ed8">GitHub / fatdarkness6</link>'
              f' &nbsp; | &nbsp; <link href="{escape(contact["linkedin"])}" color="#1d4ed8">LinkedIn / Arsam Sarkhosh</link>', small),
    Spacer(1, 8), Paragraph(text(profile["summary"]), body),
]
story.extend(section("PROFESSIONAL EXPERIENCE"))
for experience in data["experience"]:
    block = [
        Paragraph(text(experience["company"]) + ' <font color="#475569">/ '
                  + text(experience["role"]) + "</font>", project_title),
        Paragraph(text(experience["location"]) + " &nbsp; | &nbsp; " + text(experience["period"]), small),
    ]
    block.extend(Paragraph("- " + text(item), bullet) for item in experience["bullets"])
    block.append(Spacer(1, 7))
    story.append(KeepTogether(block))

story.extend([PageBreak(),
              Paragraph("TECHNICAL PROFILE & PROJECTS", style("PageTitle", 19, 24, blue, bold=True, after=4)),
              Paragraph(text(profile["name"]) + " / " + text(profile["role"]), small)])
story.extend(section("TECHNICAL SKILLS"))
for group in profile["skills"]:
    story.append(Paragraph("<b>" + text(group["label"]) + ":</b> " + text(", ".join(group["items"])), body))

story.extend(section("PROJECT PORTFOLIO"))
for project in data["projects"]:
    label = "<b>" + text(project["name"]) + "</b>"
    if project.get("href"):
        label = f'<link href="{escape(project["href"])}" color="#1d4ed8">{label}</link>'
    story.append(Paragraph(label + " - " + text(project["summary"]), project_style))

story.extend(section("EDUCATION & CONTINUED LEARNING"))
education = profile["education"]
story.extend([Paragraph(text(education["qualification"]), project_title),
              Paragraph(text(education["period"]), small),
              Paragraph(text(education["summary"]), small), Spacer(1, 4)])
for course in profile["courses"]:
    story.append(Paragraph("<b>" + text(course["title"]) + "</b> / " + text(course["provider"])
                           + " &nbsp; | &nbsp; " + text(course["period"]), small))
story.extend([Spacer(1, 8),
              Paragraph("<b>Languages:</b> " + text(" / ".join(language["name"] + " " + language["level"]
                                                            for language in profile["languages"])), body),
              Paragraph("<b>Interests:</b> " + text(", ".join(profile["interests"])), small),
              Paragraph("Professional references available on request.", small)])


def footer(canvas, doc):
    canvas.setStrokeColor(rule)
    canvas.line(40, 37, A4[0] - 40, 37)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(muted)
    canvas.drawString(40, 25, profile["name"] + " / " + profile["role"])
    canvas.drawRightString(A4[0] - 40, 25, f"{doc.page} / {data['pages']}")


doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=40, leftMargin=40,
                        topMargin=32, bottomMargin=48, title=profile["name"] + " - Resume",
                        author=profile["name"], subject=profile["role"] + " profile")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
reader = PdfReader(output)
if len(reader.pages) != data["pages"]:
    raise RuntimeError(f"Expected {data['pages']} pages, got {len(reader.pages)}; adjust layout before publishing.")
print(f"Generated {len(reader.pages)}-page resume: {output}")
