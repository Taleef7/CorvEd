$base = "C:\Users\talee\OneDrive - Higher Education Commission\projects\CorvEd"
$files = @(Get-ChildItem "$base\app" -Recurse -Filter "*.tsx") + @(Get-ChildItem "$base\components" -Recurse -Filter "*.tsx")

$changes = @(
    # dark mode bg remnants
    " dark:bg-[#121212]", "",
    " dark:bg-[#1A1A1A]", "",
    " dark:bg-zinc-950", "",
    " dark:bg-zinc-900/30", "",
    " dark:bg-zinc-900/10", "",
    " dark:bg-amber-900/10", "",
    " dark:bg-amber-900/30", "",
    " dark:bg-yellow-900/30", "",
    " dark:bg-red-900/20", "",
    " dark:bg-red-900/30", "",
    " dark:bg-emerald-900/30", "",
    " dark:bg-blue-900/30", "",
    " dark:bg-indigo-900/30", "",
    " dark:bg-purple-900/30", "",
    " dark:bg-orange-950/30", "",
    # dark mode text remnants
    " dark:text-red-400", "",
    " dark:text-red-500", "",
    " dark:text-amber-400", "",
    " dark:text-orange-400", "",
    " dark:text-yellow-300", "",
    " dark:text-emerald-400", "",
    " dark:text-blue-400", "",
    " dark:text-purple-400", "",
    " dark:hover:text-zinc-100", "",
    " dark:hover:text-zinc-300", "",
    " dark:hover:border-indigo-600", "",
    " dark:hover:text-indigo-400", "",
    # dark mode border remnants  
    " dark:border-amber-800", "",
    " dark:border-amber-800/60", "",
    " dark:border-orange-800/60", "",
    " dark:border-red-800", "",
    " dark:border-[#444]", "",
    # form input: rounded border variant
    "rounded border border-[#B0B0B0] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none", "border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0]",
    "rounded border border-[#B0B0B0] px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none", "border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none",
    "w-full rounded border border-[#B0B0B0] px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none", "w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none",
    "mt-0.5 w-full rounded border border-[#B0B0B0] px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none", "mt-0.5 w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none",
    "rounded border border-[#B0B0B0] px-2 py-1 text-xs", "border-2 border-[#121212] px-2 py-1 text-xs",
    " border border-[#B0B0B0] px-2 py-1.5 text-sm", " border-2 border-[#121212] px-2 py-1.5 text-sm",
    " border border-[#B0B0B0] px-2 py-1 text-xs", " border-2 border-[#121212] px-2 py-1 text-xs",
    "border border-red-200 bg-red-50", "border-l-4 border-[#D02020] bg-[#D02020]/5",
    # session STATUS COLOURS in session.ts style (for badge colors in components)
    "inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700", "inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 border-[#121212] bg-[#121212] text-white",
    "inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700", "inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]",
    "inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700", "inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 border-[#1040C0] bg-[#1040C0] text-white",
    "inline-inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700", "inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 border-[#1040C0] bg-[#1040C0] text-white",
    # status colour mapping strings (in JS objects)
    "'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'", "'border-2 border-[#1040C0] bg-[#1040C0]/10 text-[#1040C0]'",
    "'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'", "'border-2 border-[#1040C0] bg-[#1040C0] text-white'",
    "'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'", "'border-2 border-[#121212] bg-[#121212] text-white'",
    "'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'", "'border-2 border-[#D02020] bg-[#D02020]/10 text-[#D02020]'",
    "'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'", "'border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]'",
    # warning/alert boxes
    "border-amber-200 bg-amber-50", "border-l-4 border-[#F0C020] bg-[#F0C020]/10",
    "border-orange-200 bg-orange-50", "border-l-4 border-[#F0C020] bg-[#F0C020]/10",
    # warning text colors
    "'text-amber-700", "'text-[#121212]",
    "'text-orange-700", "'text-[#121212]",
    "text-amber-700", "text-[#121212]",
    "text-amber-800", "text-[#121212]",
    "text-orange-700", "text-[#121212]",
    # emerald button in TutorActions  
    "bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60", "inline-flex min-h-[36px] items-center border-2 border-[#121212] bg-[#121212] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5",
    # emerald status badge
    "inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700", "inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest border-2 border-[#121212] bg-[#121212] text-white",
    # circle avatar/step
    "rounded-full bg-[#E0E8FF] text-sm font-bold text-[#0830A0]", "flex items-center justify-center border-2 border-[#1040C0] bg-[#1040C0] text-sm font-bold text-white",
    # tag badges  
    "rounded-full bg-[#F0F0FF] px-3 py-1 text-sm font-medium text-[#0830A0]", "border-2 border-[#1040C0] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1040C0]",
    # dark mode specific wrapper (leave bg but remove dark:)
    "dark:bg-zinc-950 text-[#121212]", "text-[#121212]",
    # hover:text on links  
    " dark:hover:text-indigo-400", "",
    "hover:text-[#1040C0] dark:hover", "hover:text-[#1040C0] hover"
)

$updatedFiles = 0
for ($i = 0; $i -lt $files.Count; $i++) {
    $path = $files[$i].FullName
    try {
        $c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        $c2 = $c
        for ($j = 0; $j -lt $changes.Count; $j += 2) {
            $c2 = $c2.Replace($changes[$j], $changes[$j + 1])
        }
        if ($c2 -ne $c) {
            [System.IO.File]::WriteAllText($path, $c2, [System.Text.Encoding]::UTF8)
            $updatedFiles++
            Write-Output "Updated: $($files[$i].Name)"
        }
    }
    catch {
        Write-Output "Error on $path : $_"
    }
}
Write-Output "Done. Files updated: $updatedFiles"


$changes = @(
    # remaining zinc/dark text
    "text-zinc-400 dark:text-[#121212]/60", "text-[#121212]/40",
    "text-sm text-zinc-400", "text-sm text-[#121212]/40",
    "text-xs text-zinc-400", "text-xs text-[#121212]/40",
    "text-zinc-400", "text-[#121212]/40",
    "text-zinc-500", "text-[#121212]/60",
    "text-zinc-600", "text-[#121212]/70",
    "text-zinc-700", "text-[#121212]/80",
    "text-zinc-800", "text-[#121212]",
    "text-zinc-900", "text-[#121212]",
    # dark: text remnants
    " dark:text-zinc-50", "",
    " dark:text-zinc-100", "",
    " dark:text-zinc-200", "",
    " dark:text-zinc-300", "",
    " dark:text-zinc-400", "",
    " dark:text-zinc-500", "",
    " dark:text-zinc-600", "",
    " dark:text-indigo-300", "",
    " dark:text-indigo-400", "",
    # bg remnants
    "bg-zinc-50", "bg-[#F0F0F0]",
    "bg-zinc-100", "bg-[#E0E0E0]",
    "bg-zinc-200", "bg-[#D0D0D0]",
    "bg-zinc-800", "bg-[#121212]",
    "bg-zinc-900", "bg-[#1A1A1A]",
    " dark:bg-zinc-700", "",
    " dark:bg-zinc-800", "",
    " dark:bg-zinc-900", "",
    " dark:bg-indigo-900/20", "",
    # border remnants
    "border-zinc-100", "border-[#E0E0E0]",
    "border-zinc-200", "border-[#D0D0D0]",
    "border-zinc-300", "border-[#B0B0B0]",
    "border-zinc-700", "border-[#444]",
    " dark:border-zinc-600", "",
    " dark:border-zinc-700", "",
    " dark:border-zinc-800", "",
    " dark:border-indigo-900", "",
    # rounded remnants in specific contexts (keeping general rounded-full for avatars)
    "rounded-2xl", "border-4 border-[#121212]",
    "rounded-xl", "border-2 border-[#121212]",
    "rounded-lg", "",
    "rounded-md", "",
    # shadow remnants
    " shadow-sm", "",
    " shadow-md", "",
    # indigo color remnants
    "bg-indigo-50", "bg-[#F0F0FF]",
    "bg-indigo-100", "bg-[#E0E8FF]",
    "bg-indigo-500", "bg-[#1040C0]",
    "bg-indigo-600", "bg-[#1040C0]",
    "bg-indigo-700", "bg-[#0830A0]",
    "text-indigo-500", "text-[#1040C0]",
    "text-indigo-600", "text-[#1040C0]",
    "text-indigo-700", "text-[#0830A0]",
    "border-indigo-100", "border-[#1040C0]/20",
    "border-indigo-900", "border-[#1040C0]",
    # divide remnants
    " dark:divide-zinc-700", "",
    " dark:divide-zinc-800", "",
    "divide-zinc-100", "divide-[#E0E0E0]",
    "divide-zinc-200", "divide-[#D0D0D0]",
    # hover remnants
    " dark:hover:bg-zinc-700", "",
    " dark:hover:bg-zinc-800", "",
    " dark:hover:bg-zinc-800/50", "",
    # placeholder remnants
    "placeholder:text-zinc-400", "placeholder:text-[#121212]/30",
    # focus remnants
    "focus:border-indigo-500", "focus:border-[#1040C0]",
    "focus:ring-indigo-500", "focus:ring-[#1040C0]"
)

$updatedFiles = 0
for ($i = 0; $i -lt $files.Count; $i++) {
    $path = $files[$i].FullName
    try {
        $c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        $c2 = $c
        for ($j = 0; $j -lt $changes.Count; $j += 2) {
            $c2 = $c2.Replace($changes[$j], $changes[$j + 1])
        }
        if ($c2 -ne $c) {
            [System.IO.File]::WriteAllText($path, $c2, [System.Text.Encoding]::UTF8)
            $updatedFiles++
            Write-Output "Updated: $($files[$i].Name) ($([System.IO.Path]::GetRelativePath($base, $path)))"
        }
    }
    catch {
        Write-Output "Error on $path`: $_"
    }
}
Write-Output "Done. Files updated: $updatedFiles"
