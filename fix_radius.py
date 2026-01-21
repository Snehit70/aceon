
from pathlib import Path

replacements = {
    "components/ui/accordion.tsx": ["rounded-lg"],
    "components/ui/alert-dialog.tsx": ["rounded-b-xl", "rounded-md", "rounded-xl"],
    "components/ui/alert.tsx": ["rounded-lg"],
    "components/ui/avatar.tsx": ["rounded-full"],
    "components/ui/badge.tsx": ["rounded-4xl"],
    "components/ui/button.tsx": ["rounded-lg"],
    "components/ui/card.tsx": ["rounded-b-xl", "rounded-t-xl", "rounded-xl"],
    "components/ui/combobox.tsx": ["rounded-lg", "rounded-md", "rounded-sm"],
    "components/ui/dropdown-menu.tsx": ["rounded-lg", "rounded-md"],
    "components/ui/field.tsx": ["rounded-lg"],
    "components/ui/input-group.tsx": ["rounded-[calc(var(--radius)-3px)]", "rounded-[calc(var(--radius)-5px)]", "rounded-lg", "rounded-none"],
    "components/ui/input.tsx": ["rounded-lg"],
    "components/ui/navigation-menu.tsx": ["rounded-lg", "rounded-md", "rounded-tl-sm"],
    "components/ui/progress.tsx": ["rounded-full"],
    "components/ui/radio-group.tsx": ["rounded-full"],
    "components/ui/scroll-area.tsx": ["rounded-full", "rounded-[inherit]"],
    "components/ui/select.tsx": ["rounded-lg", "rounded-md", "rounded-[min(var(--radius-md),10px)]"],
    "components/ui/skeleton.tsx": ["rounded-md"],
    "components/ui/tabs.tsx": ["rounded-md", "rounded-sm"],
    "components/ui/textarea.tsx": ["rounded-lg"],
    "components/ui/tooltip.tsx": ["rounded-[2px]", "rounded-md"]
}

base_path = Path("/home/snehit/projects/aceon/")

for file_rel_path, classes in replacements.items():
    file_path = base_path / file_rel_path
    if not file_path.exists():
        print(f"File not found: {file_path}")
        continue
        
    content = file_path.read_text()
    original_content = content
    
    for cls in classes:
        content = content.replace(cls, "")
        
    if content != original_content:
        file_path.write_text(content)
        print(f"Updated {file_rel_path}")
    else:
        print(f"No changes for {file_rel_path}")
