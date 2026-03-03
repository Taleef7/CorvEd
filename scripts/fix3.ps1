$base = "C:\Users\talee\OneDrive - Higher Education Commission\projects\CorvEd"
$files = @(Get-ChildItem "$base\app" -Recurse -Filter "*.tsx") + @(Get-ChildItem "$base\components" -Recurse -Filter "*.tsx")
$n = 0
foreach ($f in $files) {
  $c = [IO.File]::ReadAllText($f.FullName)
  $c2 = $c
  $c2 = $c2.Replace("hover:border-indigo-400 hover:text-[#1040C0]", "hover:border-[#1040C0] hover:text-[#1040C0]")
  $c2 = $c2.Replace(" dark:text-yellow-400", "")
  $c2 = $c2.Replace("hover:bg-zinc-300  dark:hover:bg-zinc-600", "hover:bg-[#C0C0C0]")
  $c2 = $c2.Replace(" dark:border-red-900/40 dark:bg-red-950/20", "")
  $c2 = $c2.Replace(" dark:hover:text-indigo-300", "")
  $c2 = $c2.Replace("animate-spin text-indigo-100", "animate-spin text-white/70")
  $c2 = $c2.Replace("border border-indigo-600 px-5 py-2 text-sm font-semibold text-[#1040C0] transition hover:bg-[#1040C0] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1040C0] focus:ring-offset-2", "border-2 border-[#1040C0] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#1040C0] transition hover:bg-[#1040C0] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1040C0]")
  if ($c2 -ne $c) {
    [IO.File]::WriteAllText($f.FullName, $c2)
    $n++
    Write-Output "Updated: $($f.Name)"
  }
}
Write-Output "Done. $n files."
