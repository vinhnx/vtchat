# Icon Migration Map: Unifying to lucide-react

This document maps all current icon usage in the vtchat codebase to their lucide-react equivalents.

## Migration Overview

**Target**: Unify all icon usage to `lucide-react`
**Current Packages**: 5 different icon libraries
**Files Affected**: 46+ files across the monorepo

## Icon Package Analysis

### @tabler/icons-react (Most Used - ~30 files)

| Tabler Icon | Lucide Equivalent | Status | Notes |
|-------------|-------------------|--------|-------|
| IconAlertCircle | AlertCircle | ✅ Direct match | |
| IconArrowBarLeft | PanelLeftClose | ✅ Similar | |
| IconArrowBarRight | PanelRightClose | ✅ Similar | |
| IconArrowRight | ArrowRight | ✅ Direct match | |
| IconArrowUp | ArrowUp | ✅ Direct match | |
| IconAtom | Atom | ✅ Direct match | |
| IconBolt | Zap | ✅ Similar | |
| IconBoltFilled | Zap | ✅ Similar (no filled variant) | |
| IconBook | Book | ✅ Direct match | |
| IconCaretDownFilled | ChevronDown | ✅ Similar | |
| IconCheck | Check | ✅ Direct match | |
| IconChevronDown | ChevronDown | ✅ Direct match | |
| IconCircleCheckFilled | CheckCircle | ✅ Similar | |
| IconClock | Clock | ✅ Direct match | |
| IconCodeDots | Code | ✅ Similar | |
| IconCopy | Copy | ✅ Direct match | |
| IconCornerDownRight | CornerDownRight | ✅ Direct match | |
| IconExternalLink | ExternalLink | ✅ Direct match | |
| IconFileFilled | File | ✅ Similar (no filled variant) | |
| IconHelpHexagon | HelpCircle | ✅ Similar shape | |
| IconHelpSmall | HelpCircle | ✅ Similar | |
| IconJson | FileJson | ✅ Similar | |
| IconKey | Key | ✅ Direct match | |
| IconMarkdown | FileText | ✅ Similar | |
| IconMessageCircleFilled | MessageCircle | ✅ Similar | |
| IconNorthStar | Star | ✅ Similar | |
| IconPaperclip | Paperclip | ✅ Direct match | |
| IconPencil | Pencil | ✅ Direct match | |
| IconPhotoPlus | ImagePlus | ✅ Similar | |
| IconPlayerStopFilled | Square | ✅ Similar | |
| IconPlus | Plus | ✅ Direct match | |
| IconQuestionMark | HelpCircle | ✅ Similar | |
| IconRefresh | RotateCcw | ✅ Similar | |
| IconSearch | Search | ✅ Direct match | |
| IconSelector | ChevronsUpDown | ✅ Similar | |
| IconSettings | Settings | ✅ Direct match | |
| IconSettings2 | Settings2 | ✅ Direct match | |
| IconSpiral | Loader | ✅ Similar | |
| IconSquare | Square | ✅ Direct match | |
| IconTerminal | Terminal | ✅ Direct match | |
| IconTools | Wrench | ✅ Similar | |
| IconTrash | Trash | ✅ Direct match | |
| IconUser | User | ✅ Direct match | |
| IconWorld | Globe | ✅ Direct match | |
| IconX | X | ✅ Direct match | |

### @radix-ui/react-icons (3 files)

| Radix Icon | Lucide Equivalent | Status | Notes |
|------------|-------------------|--------|-------|
| ArrowLeftIcon | ArrowLeft | ✅ Direct match | |
| ArrowRightIcon | ArrowRight | ✅ Direct match | |
| CheckIcon | Check | ✅ Direct match | |
| ChevronRightIcon | ChevronRight | ✅ Direct match | |
| DotFilledIcon | Circle | ✅ Similar | |

### react-icons (1 file)

| React Icon | Lucide Equivalent | Status | Notes |
|------------|-------------------|--------|-------|
| FaGithub | Github | ✅ Direct match | Brand icon available |
| FaGoogle | Chrome | ⚠️ Alternative | No Google brand icon, Chrome as alternative |

### @phosphor-icons/react

| Status | Notes |
|--------|-------|
| ❌ Unused | No imports found, can be removed |

## Migration Steps

1. ✅ **Remove @phosphor-icons/react** - Unused package
2. 🔄 **Migrate @radix-ui/react-icons** - Smallest scope (3 files)
3. 🔄 **Handle react-icons** - Social icons (1 file)
4. 🔄 **Migrate @tabler/icons-react** - Largest scope (~30 files)
5. 🔄 **Update package.json** - Remove old dependencies
6. 🔄 **Test and verify** - Ensure all icons render correctly

## Bundle Size Impact

**Before Migration:**
- @tabler/icons-react: ~2.1MB
- @radix-ui/react-icons: ~500KB
- react-icons: ~3.2MB
- @phosphor-icons/react: ~1.8MB
- lucide-react: ~800KB

**After Migration:**
- lucide-react only: ~800KB

**Estimated Savings:** ~6.8MB reduction in icon dependencies

## Notes

- Some filled variants in Tabler don't have direct equivalents in Lucide
- Brand icons (GitHub) are available in Lucide
- Google brand icon not available, using Chrome as alternative
- All core UI icons have good equivalents in Lucide

