# Shadcn UI & Design System

## Initialization
Run the following command to initialize the project with the specific Nova theme and configuration requested:

```bash
bunx --bun shadcn@latest create --preset "https://ui.shadcn.com/init?base=radix&style=nova&baseColor=neutral&theme=neutral&iconLibrary=hugeicons&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next" --template next
```

## Design Tokens

### Colors (Neutral Base)
- **Background**: Clean white / dark gray for dark mode.
- **Foreground**: High contrast text.
- **Accents**: Subtle neutral tones (zinc/slate/gray).

### Typography
- **Font Family**: `Inter` (Sans-serif).
- **Scale**: Standard Tailwind scale.

### Components
- **Style**: `nova`
- **Radius**: `default` (0.5rem)
- **Icons**: `hugeicons`

## Core Components to Install
- `Button`
- `Card` (for dashboards and lists)
- `Input` / `Form` (for calculators and posts)
- `Dialog` (for modals)
- `DropdownMenu` (for navigation)
- `Toast` (for notifications)
