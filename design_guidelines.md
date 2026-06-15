{
  "project": {
    "name": "Meta Ads Manager Campaigns (Replica)",
    "goal": "Recreate the provided Meta Ads Manager Campaigns dashboard screenshot as a single desktop-only page with extremely high visual fidelity. Frontend-only. Table must be horizontally + vertically scrollable and driven by editable JSON data.",
    "non_goals": [
      "No redesign / no new theme",
      "No backend/APIs/auth",
      "No mobile-first reflow requirements (desktop fidelity wins)",
      "No business logic beyond basic UI state (sorting can be mocked if needed)"
    ]
  },
  "brand_attributes": [
    "enterprise-neutral",
    "dense + data-forward",
    "high-clarity hierarchy",
    "subtle affordances (borders, hover, focus)",
    "Meta-like cool grays + blue action"
  ],
  "design_personality": {
    "visual_style": "Meta Ads Manager-like utilitarian dashboard (flat surfaces, subtle borders, compact controls)",
    "layout_principle": "App shell with left icon rail + top header + content region; table is the hero",
    "density": "compact (8–12px paddings in table cells; 28–32px control heights)",
    "do_not_change": [
      "column order/labels",
      "visible metric formatting",
      "tab labels (Campaigns / Ad sets / Ads)",
      "toolbar button order",
      "status colors and pill styles",
      "overall spacing rhythm"
    ]
  },
  "typography": {
    "font_selection": {
      "primary": "Inter (Google Fonts)",
      "fallbacks": ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      "notes": "Meta UI is close to system/Inter-like. Use Inter to match modern dashboard feel without looking stylized."
    },
    "scale": {
      "page_title_h1": "text-2xl font-semibold tracking-tight",
      "section_title": "text-sm font-semibold",
      "tab_label": "text-sm font-medium",
      "toolbar_button": "text-sm font-medium",
      "table_header": "text-xs font-semibold uppercase tracking-wide",
      "table_cell": "text-sm font-normal",
      "muted_meta": "text-xs text-muted-foreground"
    },
    "line_height": {
      "dense": "leading-5",
      "table": "leading-5"
    }
  },
  "color_system": {
    "strategy": "Match screenshot: cool neutral grays, white surfaces, subtle borders, Meta-like blue for primary actions, green for active/delivery, amber/gray for learning/limited.",
    "tokens_css_variables": {
      "location": "/app/frontend/src/index.css",
      "add_or_override": {
        "--background": "210 20% 98%",
        "--foreground": "222 47% 11%",
        "--card": "0 0% 100%",
        "--card-foreground": "222 47% 11%",
        "--muted": "210 16% 94%",
        "--muted-foreground": "215 16% 35%",
        "--border": "214 20% 88%",
        "--input": "214 20% 88%",
        "--ring": "214 90% 52%",
        "--primary": "214 90% 52%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "210 16% 96%",
        "--secondary-foreground": "222 47% 11%",
        "--accent": "210 16% 96%",
        "--accent-foreground": "222 47% 11%",
        "--destructive": "0 72% 51%",
        "--destructive-foreground": "0 0% 100%",
        "--radius": "0.375rem"
      }
    },
    "semantic_colors": {
      "surface_app": "bg-[hsl(var(--background))]",
      "surface_panel": "bg-white",
      "surface_table_header": "bg-[hsl(var(--secondary))]",
      "border_default": "border-[hsl(var(--border))]",
      "text_primary": "text-[hsl(var(--foreground))]",
      "text_muted": "text-[hsl(var(--muted-foreground))]",
      "action_primary": "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
      "focus_ring": "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
      "status": {
        "active": {
          "bg": "bg-emerald-50",
          "text": "text-emerald-700",
          "dot": "bg-emerald-500"
        },
        "paused": {
          "bg": "bg-slate-100",
          "text": "text-slate-700",
          "dot": "bg-slate-500"
        },
        "learning": {
          "bg": "bg-amber-50",
          "text": "text-amber-800",
          "dot": "bg-amber-500"
        },
        "error": {
          "bg": "bg-rose-50",
          "text": "text-rose-700",
          "dot": "bg-rose-500"
        }
      }
    },
    "gradients": {
      "policy": "Do not introduce gradients. Screenshot-style UI is flat. If any gradient exists in screenshot, keep it extremely subtle and limited to <20% viewport.",
      "allowed": []
    }
  },
  "layout": {
    "viewport": {
      "target": "desktop",
      "min_width": 1200,
      "recommended_canvas": "1440x900"
    },
    "grid": {
      "app_shell": "Left rail (56–64px) + main content (flex-1)",
      "content_max_width": "Do NOT center with max-width; keep full-width like Ads Manager.",
      "page_padding": "px-4 (16px) outer padding inside main content"
    },
    "regions": {
      "left_sidebar": {
        "width": "w-14 (56px) or w-16 (64px) depending on screenshot",
        "style": "bg-white border-r",
        "items": "icon buttons stacked; active item has subtle bg + left indicator"
      },
      "top_header": {
        "height": "h-14 (56px)",
        "style": "bg-white border-b",
        "contents": "account selector, page title, primary actions (Create/View), date range"
      },
      "sub_header_controls": {
        "height": "auto",
        "contents": "filter chips row + search + tabs + toolbar"
      },
      "table_region": {
        "behavior": "Both-axis scroll. Header row sticky. First column (selection + toggle + campaign name) can be sticky if screenshot shows it.",
        "container": "border rounded-md bg-white",
        "scroll": "overflow-auto; set explicit height calc(100vh - headerHeights)"
      }
    }
  },
  "component_spec": {
    "app_shell": {
      "structure": [
        "<SidebarRail />",
        "<TopBar />",
        "<CampaignsControls />",
        "<CampaignsTable />"
      ],
      "notes": "Keep components small and reusable; data comes from a single JSON module."
    },
    "sidebar": {
      "use": "shadcn Button (variant=ghost) + Tooltip",
      "icon_size": "18–20px",
      "hit_area": "40x40",
      "active_state": "bg-slate-100 + left 2px indicator (bg-[hsl(var(--primary))])",
      "testids": {
        "rail": "sidebar-rail",
        "nav_item": "sidebar-nav-item-<key>"
      }
    },
    "tabs": {
      "use": "shadcn Tabs",
      "style": "underline/segmented per screenshot; compact",
      "testids": {
        "tabs": "campaigns-level-tabs",
        "tab_campaigns": "campaigns-tab-campaigns",
        "tab_adsets": "campaigns-tab-adsets",
        "tab_ads": "campaigns-tab-ads"
      }
    },
    "filters_and_search": {
      "chips": {
        "use": "shadcn Badge (variant=secondary) but restyled to look like filter chips",
        "height": "h-8",
        "radius": "rounded-full",
        "spacing": "gap-2",
        "testids": {
          "chip": "filter-chip-<name>",
          "chip_clear": "filter-chip-clear-button"
        }
      },
      "search": {
        "use": "shadcn Input with left icon",
        "height": "h-9",
        "placeholder": "Search by name, ID or metrics",
        "testids": {
          "input": "campaigns-search-input"
        }
      }
    },
    "toolbar": {
      "use": "shadcn Button + DropdownMenu + Separator",
      "button_height": "h-9",
      "variants": {
        "primary": "default (blue)",
        "secondary": "secondary",
        "ghost": "ghost"
      },
      "testids": {
        "create": "campaigns-create-button",
        "columns": "campaigns-columns-button",
        "breakdown": "campaigns-breakdown-button",
        "reports": "campaigns-reports-button",
        "export": "campaigns-export-button",
        "date_range": "campaigns-date-range-button"
      }
    },
    "table": {
      "use": "shadcn Table as base, but implement custom sticky header + column sizing",
      "density": {
        "row_height": "44px typical; can be 40px if screenshot is denser",
        "cell_padding": "px-3 py-2",
        "header_padding": "px-3 py-2"
      },
      "borders": "border-b on rows; subtle vertical dividers only if screenshot shows",
      "hover": "bg-slate-50",
      "selection": {
        "use": "shadcn Checkbox",
        "testids": {
          "select_all": "table-select-all-checkbox",
          "row_checkbox": "table-row-checkbox-<rowId>"
        }
      },
      "toggle": {
        "use": "shadcn Switch (small) for on/off",
        "testids": {
          "row_toggle": "table-row-toggle-<rowId>"
        }
      },
      "sticky": {
        "header": "sticky top-0 z-20 bg-[hsl(var(--secondary))]",
        "first_column_optional": "sticky left-0 z-10 bg-white (only if screenshot shows frozen first column)"
      },
      "scroll_rules": {
        "horizontal": "min-w-[1600px] (or match screenshot columns); wrap table in overflow-x-auto",
        "vertical": "set container height: h-[calc(100vh-<measured_px>)] and overflow-y-auto",
        "bottom_summary": "sticky bottom-0 bg-white border-t (if screenshot shows results summary pinned)"
      },
      "cell_types": {
        "status_pill": "inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium",
        "delivery_dot": "h-2 w-2 rounded-full",
        "metric": "tabular-nums",
        "linkish_name": "text-[hsl(var(--primary))] hover:underline"
      },
      "testids": {
        "table": "campaigns-table",
        "header": "campaigns-table-header",
        "row": "campaigns-table-row-<rowId>",
        "cell": "campaigns-table-cell-<rowId>-<colKey>",
        "summary": "campaigns-table-summary"
      }
    },
    "date_range": {
      "use": "shadcn Popover + Calendar",
      "notes": "Even if screenshot uses a custom picker, implement with Calendar for speed; style to match.",
      "testids": {
        "trigger": "date-range-trigger",
        "calendar": "date-range-calendar"
      }
    }
  },
  "data_model": {
    "approach": "Single editable JSON file exporting columns + rows. UI reads from it. Provide a small in-app JSON editor drawer (optional) to paste/modify data quickly.",
    "files": {
      "mock_data": "src/data/campaignsData.js",
      "types": "No TS types; use JSDoc comments for structure."
    },
    "row_shape_example": {
      "id": "string",
      "selected": "boolean",
      "enabled": "boolean",
      "campaign": "string",
      "delivery": "{ status: 'Active'|'Paused'|'Learning'|'Error', detail?: string }",
      "budget": "string",
      "amountSpent": "number",
      "results": "string",
      "impressions": "number",
      "cpr": "number",
      "cpm": "number",
      "ctr": "number",
      "clicks": "number",
      "...": "other screenshot columns"
    }
  },
  "motion_microinteractions": {
    "principles": [
      "No flashy motion; keep enterprise subtle",
      "Use short durations (120–180ms) and ease-out",
      "Hover states: background tint + icon color shift",
      "Active/pressed: scale-0.98 on buttons only"
    ],
    "tailwind_recipes": {
      "button": "transition-colors duration-150 ease-out active:scale-[0.98]",
      "row_hover": "hover:bg-slate-50",
      "chip_hover": "hover:bg-slate-200/70",
      "focus": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
    }
  },
  "accessibility": {
    "requirements": [
      "All interactive elements must have visible focus",
      "Use aria-label for icon-only buttons",
      "Table headers use <th scope='col'>",
      "Ensure contrast for muted text (>= 4.5:1 where possible in dense UI)",
      "Respect prefers-reduced-motion"
    ],
    "testing_attributes": {
      "rule": "All interactive and key informational elements MUST include data-testid.",
      "convention": "kebab-case describing role (not appearance)."
    }
  },
  "implementation_notes_for_main_agent": {
    "do_first": [
      "Remove CRA default App.css centering/header styles from affecting layout (do not use .App-header).",
      "Set body background to light gray (tokenized) and ensure main content is not centered.",
      "Build layout skeleton first (sidebar/topbar/controls/table container), then lock spacing, then fill table columns."
    ],
    "exactness_playbook": [
      "Measure screenshot: paddings, row heights, font sizes. Encode as constants.",
      "Prefer explicit widths for key columns (campaign name, delivery, budget, amount spent).",
      "Use tabular-nums for metrics.",
      "Implement sticky header; verify both-axis scroll works with large column count.",
      "Keep borders 1px and neutral; avoid shadows except tiny elevation on dropdowns."
    ],
    "libraries": {
      "icons": "lucide-react (already expected)",
      "optional": [
        "@radix-ui/react-scroll-area (already via shadcn ScrollArea)",
        "clsx + tailwind-merge (already in shadcn utils)"
      ]
    }
  },
  "component_path": {
    "shadcn_primary": [
      "/app/frontend/src/components/ui/button.jsx",
      "/app/frontend/src/components/ui/input.jsx",
      "/app/frontend/src/components/ui/badge.jsx",
      "/app/frontend/src/components/ui/tabs.jsx",
      "/app/frontend/src/components/ui/table.jsx",
      "/app/frontend/src/components/ui/checkbox.jsx",
      "/app/frontend/src/components/ui/switch.jsx",
      "/app/frontend/src/components/ui/dropdown-menu.jsx",
      "/app/frontend/src/components/ui/popover.jsx",
      "/app/frontend/src/components/ui/calendar.jsx",
      "/app/frontend/src/components/ui/tooltip.jsx",
      "/app/frontend/src/components/ui/separator.jsx",
      "/app/frontend/src/components/ui/scroll-area.jsx"
    ],
    "custom_components_to_create": [
      "src/components/SidebarRail.js",
      "src/components/TopBar.js",
      "src/components/CampaignsControls.js",
      "src/components/CampaignsTable.js",
      "src/components/JsonDataEditorDrawer.js (optional)"
    ]
  },
  "image_urls": {
    "policy": "No marketing imagery needed; this is a product UI replica.",
    "urls": []
  },
  "references": {
    "inspiration_links": [
      "https://dribbble.com/search/campaign-table",
      "https://dribbble.com/search/sticky-table-header",
      "https://dribbble.com/search/horizontal-scroll-dashboard",
      "https://dribbble.com/search/facebook-ads-dashboard"
    ],
    "notes": "Use these only for interaction patterns (sticky header, dense table). Do not redesign away from screenshot."
  },
  "general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
