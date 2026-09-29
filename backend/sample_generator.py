import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_sample_pdf(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#31AAA9'),
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#6C1A1A'),
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#6C1A1A'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#333333'),
        spaceAfter=8
    )

    story = []
    story.append(Paragraph("PLAN2SITE AI - DEMO CONSTRUCTION MASTER PLAN", title_style))
    story.append(Paragraph("Project: <b>My House Project</b> | Type: Residential Construction | Location: Pune | Start Date: Day 1", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#31AAA9'), spaceAfter=15))

    story.append(Paragraph("1. Executive Summary & Project Scope", h2_style))
    story.append(Paragraph(
        "This master plan outlines the baseline execution schedule for the construction of a 2-story residential house in Pune. "
        "The project consists of 11 sequential core activities spanning 50 calendar days. All contractors and site managers "
        "must adhere strictly to the target start and completion timelines established in this document to prevent schedule slippage.",
        body_style
    ))

    story.append(Paragraph("2. Baseline Execution Schedule & Work Breakdown", h2_style))
    
    data = [
        ["Seq", "Task Name", "Description", "Planned Start", "Planned End", "Duration"],
        ["1", "Site Preparation", "Clear site debris, set up temporary fencing and utility connections.", "Day 1", "Day 2", "2 Days"],
        ["2", "Excavation", "Earthwork excavation for foundations, footing trenches, and soil disposal.", "Day 3", "Day 5", "3 Days"],
        ["3", "Foundation", "Concrete footings, RCC sub-structure, and column starter placement.", "Day 6", "Day 10", "5 Days"],
        ["4", "Columns & Beams", "Erection of RCC columns, beam shuttering, and structural pouring.", "Day 11", "Day 16", "6 Days"],
        ["5", "Brickwork", "Superstructure AAC brick masonry walls for ground and first floor.", "Day 17", "Day 25", "9 Days"],
        ["6", "Electrical Work", "Electrical conduit chasing, box embedding, and main wiring layout.", "Day 24", "Day 28", "5 Days"],
        ["7", "Plumbing Work", "Water supply piping, drainage line installation, and sanitary rough-in.", "Day 26", "Day 30", "5 Days"],
        ["8", "Plastering", "Internal smooth plaster finish and external weather-proof plastering.", "Day 31", "Day 36", "6 Days"],
        ["9", "Flooring", "Vitrified tile laying in living rooms and anti-skid tiles in bathrooms.", "Day 37", "Day 42", "6 Days"],
        ["10", "Painting", "Wall primer, putty application, and final coat acrylic emulsion paint.", "Day 43", "Day 47", "5 Days"],
        ["11", "Final Inspection", "Quality snag audit, safety clearance, and client key handover.", "Day 48", "Day 50", "3 Days"]
    ]

    table = Table(data, colWidths=[30, 105, 220, 60, 60, 55])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#31AAA9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F4F7F6')]),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("3. Site Quality & Schedule Controls", h2_style))
    story.append(Paragraph(
        "Site updates must be recorded daily by the designated Site Reporter. Concrete pouring for foundation and column works "
        "requires mandatory site inspection logs. Any delay exceeding 2 days on critical path items (Foundation, Columns, Brickwork) "
        "must be flagged immediately to the Project Planner for schedule reconciliation.",
        body_style
    ))

    doc.build(story)
    print(f"Sample PDF created at {output_path}")

if __name__ == "__main__":
    target = os.path.join(os.getcwd(), "sample-data", "sample_house_plan.pdf")
    create_sample_pdf(target)
