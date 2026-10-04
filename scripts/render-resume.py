"""Render the shared portfolio content as a compact, readable résumé PDF."""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer

sys.stdin.reconfigure(encoding="utf-8")
data = json.load(sys.stdin)
profile, contact = data["profile"], data["contact"]
output = Path(sys.argv[1])
output.parent.mkdir(parents=True, exist_ok=True)
blue = colors.HexColor("#1d4ed8")
ink = colors.HexColor("#172033")
muted = colors.HexColor("#475569")


def text(value):
    return escape(value.replace("—", " - ").replace("–", "-").replace("’", "'").replace("→", "/"))


def style(name, size, leading, color=ink, bold=False, after=0):
    return ParagraphStyle(name, fontName="Helvetica-Bold" if bold else "Helvetica", fontSize=size,
                          leading=leading, textColor=color, alignment=TA_LEFT, spaceAfter=after)


body = style("Body", 10, 14, after=5)
small = style("Meta", 8.5, 12, muted, after=4)
heading = style("Heading", 10, 14, blue, bold=True, after=8)
project_title = style("Project", 11, 15, bold=True, after=2)
bullet = style("Bullet", 9.5, 13, after=3)
bullet.leftIndent = 10
bullet.firstLineIndent = -7
story = [
    Paragraph(text(profile["name"]), style("Name", 27, 32, blue, bold=True, after=5)),
    Paragraph(text(profile["role"]), style("Role", 12, 17, bold=True, after=9)),
    Paragraph(f'<link href="mailto:{escape(contact["email"])}" color="#1d4ed8">{text(contact["email"])}</link>', small),
    Paragraph(f'<link href="{escape(contact["github"])}" color="#1d4ed8">GitHub / fatdarkness6</link>'
              f' &nbsp; | &nbsp; <link href="{escape(contact["linkedin"])}" color="#1d4ed8">LinkedIn / Arsam Sarkhosh</link>', small),
    Spacer(1, 7),
    Paragraph(text(profile["summary"]), body),
    Spacer(1, 8),
    HRFlowable(width="100%", thickness=0.7, color=colors.HexColor("#cbd5e1")),
    Spacer(1, 12),
    Paragraph("CORE TOOLSET", heading),
]
for ids in (("vue-nuxt", "quasar-ts"), ("backends", "data"), ("ai", "creative")):
    tools = [tool for tool in profile["tools"] if tool["id"] in ids]
    story.append(Paragraph(" &nbsp; / &nbsp; ".join(text(tool["name"]) for tool in tools)
                           + " - " + text(", ".join(tag for tool in tools for tag in tool["tags"])), small))
story.extend([Spacer(1, 12), Paragraph("SELECTED PROJECT EXPERIENCE", heading)])
for project in data["projects"]:
    block = [
        Paragraph(text(project["name"]), project_title),
        Paragraph(text(project["role"] + " / " + project["ownership"]), small),
    ]
    block.extend(Paragraph("- " + text(item), bullet) for item in project["contributions"])
    block.append(Spacer(1, 9))
    story.append(KeepTogether(block))


def footer(canvas, doc):
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(muted)
    canvas.drawString(40, 25, profile["name"] + " / " + profile["role"])
    canvas.drawRightString(A4[0] - 40, 25, "1 / 1")


doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=40, leftMargin=40,
                        topMargin=36, bottomMargin=40, title=profile["name"] + " - Resume",
                        author=profile["name"], subject="Full-stack engineering profile")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
reader = PdfReader(output)
if len(reader.pages) != 1:
    raise RuntimeError("Resume must fit on one page; adjust spacing before publishing.")
print(f"Generated one-page resume: {output}")
