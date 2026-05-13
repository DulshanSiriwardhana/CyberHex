import re

checklist_file = "/home/dulshan/CyberHex/CyberHex/v1_release_checklist.md"
with open(checklist_file, "r") as f:
    lines = f.readlines()

done_items = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 23, 24, 25, 27, 29, 30, 31, 32, 33, 34, 39, 40, 41, 43, 44, 46, 47}

out_lines = []
for line in lines:
    m = re.match(r"^(\d+)\.\s+(.*)", line)
    if m:
        num = int(m.group(1))
        content = m.group(2)
        if num in done_items:
            out_lines.append(f"- [x] {num}. {content}\n")
        else:
            out_lines.append(f"- [ ] {num}. {content}\n")
    elif line.startswith("
        out_lines.append(f"\n{line}")
    elif line.strip() == "" or line.startswith("
        pass

with open("/home/dulshan/.gemini/antigravity/brain/f5ef1f8d-f14c-4397-87bc-010524ad891d/task.md", "w") as f:
    f.writelines(out_lines)
