
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

# Data for the Gantt Chart
tasks = [
    # Task Name, Start Date, End Date, Category
    ("Project Init & DB Design", "2025-10-01", "2025-10-07", "Setup"),
    
    ("Auth Service: Development", "2025-10-05", "2025-10-15", "Dev"),
    ("Auth Service: Unit Testing", "2025-10-12", "2025-10-18", "Test"),
    
    ("Frontend: Dashboard UI", "2025-10-15", "2025-12-05", "Frontend"),
    
    ("GitHub Sync Svc: Development", "2025-10-18", "2025-11-05", "Dev"),
    ("GitHub Sync Svc: Testing", "2025-11-01", "2025-11-08", "Test"),
    
    ("Resume Builder Svc: Development", "2025-11-05", "2025-11-25", "Dev"),
    ("Resume Builder Svc: Testing", "2025-11-20", "2025-11-30", "Test"),
    
    ("Job Fetcher Svc: Development", "2025-11-15", "2025-12-05", "Dev"),
    ("Job Fetcher Svc: Testing", "2025-12-01", "2025-12-10", "Test"),
    
    ("System Integration & E2E Testing", "2025-12-05", "2025-12-18", "Test"),
    ("Final Deployment & Docs", "2025-12-18", "2025-12-24", "Deploy"),
]

# Convert dates to datetime objects
task_data = []
for task, start, end, category in tasks:
    task_data.append({
        "Task": task,
        "Start": datetime.strptime(start, "%Y-%m-%d"),
        "End": datetime.strptime(end, "%Y-%m-%d"),
        "Category": category
    })

# Reverse order so first task is at top
task_data.reverse()

# Colors for categories
colors = {
    "Setup": "#95a5a6",    # Grey
    "Dev": "#3498db",      # Blue
    "Test": "#2ecc71",     # Green
    "Frontend": "#9b59b6", # Purple
    "Deploy": "#e67e22"    # Orange
}

# Create Figure
fig, ax = plt.subplots(figsize=(14, 8))

# Plot Bars
for i, task in enumerate(task_data):
    start_date = mdates.date2num(task["Start"])
    end_date = mdates.date2num(task["End"])
    duration = end_date - start_date
    
    color = colors.get(task["Category"], "#34495e")
    
    ax.barh(i, duration, left=start_date, height=0.6, align='center', color=color, edgecolor='black', alpha=0.9)
    
    # Add date text inside or next to bar
    # ax.text(start_date + duration/2, i, f"{task['Duration']} days", ha='center', va='center', color='white', fontsize=9, fontweight='bold')

# Y-Axis Labels
ax.set_yticks(range(len(task_data)))
ax.set_yticklabels([t["Task"] for t in task_data], fontsize=11, fontweight='bold')

# X-Axis Formatting
ax.xaxis_date()
ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
ax.xaxis.set_major_formatter(mdates.DateFormatter("%d-%b"))
plt.xticks(fontsize=10, rotation=0)

# Grid and Styling
ax.grid(True, axis='x', linestyle='--', alpha=0.5)
ax.set_axisbelow(True)
plt.title("CareerAutomate Microservices Development Plan (12 Weeks)", fontsize=16, fontweight='bold', pad=20)
plt.xlabel("Timeline (2025)", fontsize=12, fontweight='bold', labelpad=10)

# Legend
handles = [plt.Rectangle((0,0),1,1, color=colors[cat]) for cat in colors]
labels = ["Setup", "Development", "Testing", "Frontend Integration", "Deployment"]
plt.legend(handles, labels, loc='lower right', title="Phase Category")

# Adjust layout to fit everything
plt.tight_layout()

# Save
plt.savefig(r"D:\Mini_Project\Reports\gantt_chart_microservices.png", dpi=300)
