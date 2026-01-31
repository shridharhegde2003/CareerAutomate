
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

# Logic:
# Start: Sept 27, 2025
# Design: Sept 27 - Oct 11 (Fixed)
# End: Jan 10, 2026
# Flow: Auth -> GitHub -> Job Fetcher -> Resume -> Report/Email -> Testing

tasks = [
    # Task Name, Start Date, End Date, Category
    ("1. Planning & Design (Wireframes)", "2025-09-27", "2025-10-11", "Design"),
    
    ("2. Auth Service & Infra Setup", "2025-10-12", "2025-10-25", "Backend"),
    
    ("3. GitHub Sync Service", "2025-10-20", "2025-11-10", "Backend"),
    
    ("4. Job Fetcher Service", "2025-11-05", "2025-11-25", "Backend"),
    
    ("5. Resume Generator Service", "2025-11-20", "2025-12-10", "Backend"),
    
    ("6. Report & Notification Service", "2025-12-05", "2025-12-20", "Backend"),
    
    ("7. Frontend Integration (dashboard)", "2025-10-25", "2025-12-25", "Frontend"),
    
    ("8. E2E System Testing", "2025-12-20", "2026-01-05", "Test"),
    
    ("9. Final Polish & Deployment", "2026-01-05", "2026-01-10", "Deploy"),
]

# Convert dates
task_data = []
for task, start, end, category in tasks:
    task_data.append({
        "Task": task,
        "Start": datetime.strptime(start, "%Y-%m-%d"),
        "End": datetime.strptime(end, "%Y-%m-%d"),
        "Category": category
    })

# Reverse for plotting order
task_data.reverse()

# Colors
colors = {
    "Design": "#7f8c8d",   # Grey
    "Backend": "#2980b9",  # Dark Blue
    "Frontend": "#8e44ad", # Purple
    "Test": "#27ae60",     # Green
    "Deploy": "#e67e22"    # Orange
}

fig, ax = plt.subplots(figsize=(15, 8))

# Plot bars
for i, task in enumerate(task_data):
    start_date = mdates.date2num(task["Start"])
    end_date = mdates.date2num(task["End"])
    duration = end_date - start_date
    
    color = colors.get(task["Category"], "#333")
    
    # Draw bar
    ax.barh(i, duration, left=start_date, height=0.5, align='center', color=color, edgecolor='black', alpha=0.9)

# Labels
ax.set_yticks(range(len(task_data)))
ax.set_yticklabels([t["Task"] for t in task_data], fontsize=11, fontweight='bold')

# X-Axis configuration (Start to End)
ax.set_xlim([
    mdates.date2num(datetime(2025, 9, 20)), 
    mdates.date2num(datetime(2026, 1, 15))
])

ax.xaxis_date()
# Show ticks every 10 days for clarity roughly mapping to weeks/phases
ax.xaxis.set_major_locator(mdates.DayLocator(interval=14)) 
ax.xaxis.set_major_formatter(mdates.DateFormatter("%d-%b-%y"))

plt.xticks(fontsize=10, rotation=45)
plt.title("CareerAutomate Project Timeline (Sept 27, 2025 - Jan 10, 2026)", fontsize=16, fontweight='bold', pad=20)
plt.xlabel("Timeline", fontsize=12, fontweight='bold')
ax.grid(True, axis='x', linestyle='--', alpha=0.6)

# Legend
handles = [plt.Rectangle((0,0),1,1, color=colors[cat]) for cat in ["Design", "Backend", "Frontend", "Test", "Deploy"]]
labels = ["Planning/Design", "Microservice Dev", "Frontend Integration", "Testing", "Deployment"]
plt.legend(handles, labels, loc='lower right')

plt.tight_layout()
plt.savefig(r"D:\Mini_Project\Reports\gantt_chart_final.png", dpi=300)
